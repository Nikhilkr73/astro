"""
Astrology User Profile System
Stores birth data and preferences for accurate astrology readings
"""

from dataclasses import dataclass, asdict
from datetime import datetime, date, time
from typing import Optional, Dict, Any
import json
import os

@dataclass
class AstrologyProfile:
    """User profile for astrology calculations and readings"""

    # Basic identification
    user_id: str
    name: str

    # Birth data - essential for astrology (required fields)
    birth_date: str  # YYYY-MM-DD format
    birth_time: str  # HH:MM format (24-hour)
    birth_location: str  # City, Country
    birth_timezone: str  # e.g. "America/New_York", "Asia/Kolkata"

    # Optional fields
    email: Optional[str] = None
    birth_latitude: Optional[float] = None
    birth_longitude: Optional[float] = None

    # Astrology preferences
    preferred_system: str = "vedic"  # "vedic", "western", "both"
    language: str = "en"
    reading_style: str = "detailed"  # "brief", "detailed", "comprehensive"

    # User preferences
    notification_preferences: Dict[str, bool] = None
    subscription_type: str = "free"  # "free", "premium", "pro"

    # App usage data
    created_at: str = ""
    last_reading_date: Optional[str] = None
    total_readings: int = 0
    favorite_topics: list = None

    def __post_init__(self):
        if self.notification_preferences is None:
            self.notification_preferences = {
                "daily_horoscope": True,
                "weekly_forecast": True,
                "important_transits": True,
                "new_moon_full_moon": True
            }

        if self.favorite_topics is None:
            self.favorite_topics = []

        if not self.created_at:
            self.created_at = datetime.now().isoformat()

    def get_birth_datetime(self) -> datetime:
        """Get complete birth datetime object"""
        try:
            birth_dt = datetime.strptime(f"{self.birth_date} {self.birth_time}", "%Y-%m-%d %H:%M")
            return birth_dt
        except ValueError as e:
            raise ValueError(f"Invalid birth date/time format: {e}")

    def age(self) -> int:
        """Calculate current age"""
        birth_dt = datetime.strptime(self.birth_date, "%Y-%m-%d").date()
        today = date.today()
        return today.year - birth_dt.year - ((today.month, today.day) < (birth_dt.month, birth_dt.day))

    def zodiac_sun_sign(self) -> str:
        """Calculate Western zodiac sun sign"""
        birth_dt = datetime.strptime(self.birth_date, "%Y-%m-%d")
        month, day = birth_dt.month, birth_dt.day

        # Western zodiac date ranges
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return "Aries"
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return "Taurus"
        elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
            return "Gemini"
        elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
            return "Cancer"
        elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
            return "Leo"
        elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
            return "Virgo"
        elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
            return "Libra"
        elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
            return "Scorpio"
        elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
            return "Sagittarius"
        elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
            return "Capricorn"
        elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
            return "Aquarius"
        else:  # February 19 - March 20
            return "Pisces"

    def vedic_moon_sign(self) -> str:
        """Placeholder for Vedic moon sign calculation"""
        # This would require ephemeris data and complex calculations
        # For now, return a placeholder that can be calculated by external library
        return "Requires ephemeris calculation"

    def increment_reading_count(self):
        """Update reading statistics"""
        self.total_readings += 1
        self.last_reading_date = datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON storage"""
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AstrologyProfile':
        """Create profile from dictionary"""
        return cls(**data)

    def get_context_for_ai(self) -> str:
        """Generate context string for AI astrology readings"""
        birth_dt = self.get_birth_datetime()
        age = self.age()
        sun_sign = self.zodiac_sun_sign()

        context = f"""
        User Profile for Astrology Reading:
        - Name: {self.name}
        - Age: {age} years old
        - Birth: {birth_dt.strftime('%B %d, %Y at %I:%M %p')} in {self.birth_location}
        - Western Sun Sign: {sun_sign}
        - Preferred System: {self.preferred_system.title()}
        - Reading Style: {self.reading_style.title()}
        - Total Previous Readings: {self.total_readings}
        - Subscription: {self.subscription_type.title()}
        """

        if self.favorite_topics:
            context += f"\n- Favorite Topics: {', '.join(self.favorite_topics)}"

        return context.strip()

class AstrologyProfileManager:
    """Manages astrology user profiles with persistence"""

    def __init__(self, storage_dir: str = "astrology_data"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
        self.profiles_file = os.path.join(storage_dir, "user_profiles.json")
        self._load_profiles()

    def _load_profiles(self):
        """Load profiles from storage"""
        try:
            if os.path.exists(self.profiles_file):
                with open(self.profiles_file, 'r') as f:
                    data = json.load(f)
                    self.profiles = {
                        user_id: AstrologyProfile.from_dict(profile_data)
                        for user_id, profile_data in data.items()
                    }
            else:
                self.profiles = {}
        except Exception as e:
            print(f"Error loading profiles: {e}")
            self.profiles = {}

    def _save_profiles(self):
        """Save profiles to storage"""
        try:
            data = {
                user_id: profile.to_dict()
                for user_id, profile in self.profiles.items()
            }
            with open(self.profiles_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving profiles: {e}")

    def create_profile(self, profile: AstrologyProfile) -> bool:
        """Create new user profile"""
        try:
            if profile.user_id in self.profiles:
                return False  # Profile already exists

            self.profiles[profile.user_id] = profile
            self._save_profiles()
            print(f"✅ Created astrology profile for user: {profile.user_id}")
            return True
        except Exception as e:
            print(f"Error creating profile: {e}")
            return False

    def get_profile(self, user_id: str) -> Optional[AstrologyProfile]:
        """Get user profile by ID"""
        return self.profiles.get(user_id)

    def update_profile(self, profile: AstrologyProfile) -> bool:
        """Update existing profile"""
        try:
            self.profiles[profile.user_id] = profile
            self._save_profiles()
            return True
        except Exception as e:
            print(f"Error updating profile: {e}")
            return False

    def delete_profile(self, user_id: str) -> bool:
        """Delete user profile"""
        try:
            if user_id in self.profiles:
                del self.profiles[user_id]
                self._save_profiles()
                return True
            return False
        except Exception as e:
            print(f"Error deleting profile: {e}")
            return False

    def list_all_profiles(self) -> Dict[str, AstrologyProfile]:
        """Get all profiles"""
        return self.profiles.copy()

    def get_users_by_sign(self, sign: str) -> list:
        """Get all users with specific sun sign"""
        return [
            profile for profile in self.profiles.values()
            if profile.zodiac_sun_sign().lower() == sign.lower()
        ]

# Global profile manager instance
astrology_profile_manager = AstrologyProfileManager()