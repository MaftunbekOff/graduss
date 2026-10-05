//! Kampaniya qoidalari (all-or-nothing + bosqichli to'lov). Sof funksiyalar: bazaga bog'liq emas, test qilinadi.
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub const MIN_PLEDGE: i64 = 1_000;
pub const MAX_PLEDGE: i64 = 1_000_000_000;
pub const MIN_GOAL: i64 = 100_000;
pub const MAX_GOAL: i64 = 10_000_000_000;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Phase {
    Active,
    Funded,
    Failed,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Locked,
    Voting,
    Released,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub percent: u32,
    pub status: Status,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub report: Option<String>,
    #[serde(default)]
    pub approvals: Vec<Uuid>,
}

pub fn phase(now: DateTime<Utc>, deadline: DateTime<Utc>, raised: i64, goal: i64) -> Phase {
    if now < deadline {
        Phase::Active
    } else if raised >= goal {
        Phase::Funded
    } else {
        Phase::Failed
    }
}

/// Birinchi hali tasdiqlanmagan bosqich indeksi (bosqichlar ketma-ket ishlaydi).
pub fn current(ms: &[Milestone]) -> Option<usize> {
    ms.iter().position(|m| m.status != Status::Released)
}

/// Yangi kampaniya ochish mumkinmi: oldingisi yo'q, muvaffaqiyatsiz, yoki to'liq yakunlangan bo'lsa.
pub fn can_create(last: Option<(Phase, &[Milestone])>) -> bool {
    match last {
        None => true,
        Some((Phase::Failed, _)) => true,
        Some((Phase::Funded, ms)) => ms.iter().all(|m| m.status == Status::Released),
        Some((Phase::Active, _)) => false,
    }
}

pub fn validate_new(goal: i64, days: i64, ms: &[(String, u32)]) -> Result<(), &'static str> {
    if !(MIN_GOAL..=MAX_GOAL).contains(&goal) {
        return Err("Maqsad summasi noto'g'ri");
    }
    if !(1..=90).contains(&days) {
        return Err("Muddat 1-90 kun bo'lishi kerak");
    }
    if ms.is_empty() || ms.len() > 6 {
        return Err("Bosqichlar soni 1-6 bo'lishi kerak");
    }
    if ms.iter().any(|(t, p)| t.trim().is_empty() || t.chars().count() > 80 || *p == 0) {
        return Err("Har bir bosqichda nom va foiz bo'lishi kerak");
    }
    if ms.iter().map(|(_, p)| *p).sum::<u32>() != 100 {
        return Err("Bosqich foizlari yig'indisi 100 bo'lishi kerak");
    }
    Ok(())
}

/// Egasi joriy bosqich hisobotini yuboradi, ovoz berish ochiladi.
pub fn submit_report(ms: &mut [Milestone], report: &str) -> Result<(), &'static str> {
    let report = report.trim();
    if report.is_empty() || report.chars().count() > 2000 {
        return Err("Hisobot 1-2000 belgi bo'lishi kerak");
    }
    let i = current(ms).ok_or("Barcha bosqichlar tugagan")?;
    if ms[i].status != Status::Locked {
        return Err("Bu bosqich uchun hisobot allaqachon yuborilgan");
    }
    ms[i].report = Some(report.to_string());
    ms[i].status = Status::Voting;
    ms[i].approvals.clear();
    Ok(())
}

/// Faqat donor, bir marta; donorlarning yarmidan ko'pi tasdiqlasa bosqich ochiladi.
pub fn approve(ms: &mut [Milestone], user: Uuid, backers: &[Uuid]) -> Result<(), &'static str> {
    let i = current(ms).ok_or("Barcha bosqichlar tugagan")?;
    if ms[i].status != Status::Voting {
        return Err("Hozir ovoz berish ochiq emas");
    }
    if !backers.contains(&user) {
        return Err("Faqat donorlar tasdiqlay oladi");
    }
    if ms[i].approvals.contains(&user) {
        return Err("Siz allaqachon tasdiqlagansiz");
    }
    ms[i].approvals.push(user);
    if ms[i].approvals.len() * 2 > backers.len() {
        ms[i].status = Status::Released;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    fn ms(n: usize) -> Vec<Milestone> {
        (0..n)
            .map(|i| Milestone {
                id: format!("m{}", i + 1),
                title: format!("B{}", i + 1),
                percent: 100 / n as u32,
                status: Status::Locked,
                report: None,
                approvals: vec![],
            })
            .collect()
    }

    #[test]
    fn phase_rules() {
        let now = Utc::now();
        assert_eq!(phase(now, now + Duration::days(1), 0, 10), Phase::Active);
        // muddat ichida maqsad bajarilgan bo'lsa ham kampaniya muddat tugaguncha faol
        assert_eq!(phase(now, now + Duration::days(1), 99, 10), Phase::Active);
        assert_eq!(phase(now, now - Duration::days(1), 10, 10), Phase::Funded);
        assert_eq!(phase(now, now - Duration::days(1), 9, 10), Phase::Failed);
    }

    #[test]
    fn create_rules() {
        let mut done = ms(2);
        assert!(can_create(None));
        assert!(can_create(Some((Phase::Failed, &done))));
        assert!(!can_create(Some((Phase::Active, &done))));
        assert!(!can_create(Some((Phase::Funded, &done))));
        for m in &mut done {
            m.status = Status::Released;
        }
        assert!(can_create(Some((Phase::Funded, &done))));
    }

    #[test]
    fn validation() {
        let ok = vec![("A".to_string(), 60), ("B".to_string(), 40)];
        assert!(validate_new(1_000_000, 30, &ok).is_ok());
        assert!(validate_new(10, 30, &ok).is_err());
        assert!(validate_new(1_000_000, 0, &ok).is_err());
        assert!(validate_new(1_000_000, 91, &ok).is_err());
        assert!(validate_new(1_000_000, 30, &[]).is_err());
        assert!(validate_new(1_000_000, 30, &[("A".into(), 50), ("B".into(), 40)]).is_err());
        assert!(validate_new(1_000_000, 30, &[("".into(), 100)]).is_err());
    }

    #[test]
    fn report_then_majority_release() {
        let (a, b, c) = (Uuid::new_v4(), Uuid::new_v4(), Uuid::new_v4());
        let backers = [a, b, c];
        let mut m = ms(2);
        // ovoz berish ochilmaguncha tasdiqlab bo'lmaydi
        assert!(approve(&mut m, a, &backers).is_err());
        assert!(submit_report(&mut m, "  ").is_err());
        submit_report(&mut m, "Bajarildi").unwrap();
        assert!(submit_report(&mut m, "Yana").is_err());
        // donor bo'lmagan tasdiqlay olmaydi
        assert!(approve(&mut m, Uuid::new_v4(), &backers).is_err());
        approve(&mut m, a, &backers).unwrap();
        assert!(approve(&mut m, a, &backers).is_err());
        assert_eq!(m[0].status, Status::Voting); // 1/3 yetarli emas
        approve(&mut m, b, &backers).unwrap();
        assert_eq!(m[0].status, Status::Released); // 2/3 > 50%
        assert_eq!(current(&m), Some(1));
        // keyingi bosqich qulflangan holda boshlanadi
        assert_eq!(m[1].status, Status::Locked);
    }

    #[test]
    fn exactly_half_is_not_enough() {
        let (a, b) = (Uuid::new_v4(), Uuid::new_v4());
        let mut m = ms(1);
        submit_report(&mut m, "x").unwrap();
        approve(&mut m, a, &[a, b]).unwrap();
        assert_eq!(m[0].status, Status::Voting);
        approve(&mut m, b, &[a, b]).unwrap();
        assert_eq!(m[0].status, Status::Released);
    }
}
