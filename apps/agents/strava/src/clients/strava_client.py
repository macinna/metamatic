import json
import requests
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from pathlib import Path

from models.strava_models import StravaActivity


class StravaClientInterface(ABC):
    """Abstract interface for Strava API interactions"""
    
    @abstractmethod
    def get_activity_details(self, activity_id: str) -> StravaActivity:
        """Retrieve detailed information about a specific activity"""
        pass


class StravaClient(StravaClientInterface):
    """Production Strava API client"""
    
    def __init__(self, access_token: str, base_url: str = "https://www.strava.com/api/v3"):
        self.access_token = access_token
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        })
    
    def get_activity_details(self, activity_id: str) -> StravaActivity:
        """Fetch activity details from Strava API"""
        try:
            url = f"{self.base_url}/activities/{activity_id}"
            response = self.session.get(url, params={'include_all_efforts': False})
            response.raise_for_status()
            
            activity_data = response.json()
            return StravaActivity(**activity_data)
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch activity {activity_id} from Strava API: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to parse activity {activity_id} data: {str(e)}")


class MockStravaClient(StravaClientInterface):
    """Mock Strava client for testing and development"""
    
    def __init__(self, fixtures_path: Optional[Path] = None):
        self.fixtures_path = fixtures_path or self._get_default_fixtures_path()
        self._activity_responses: Dict[str, Dict[str, Any]] = {}
        self._load_default_fixtures()
    
    def _get_default_fixtures_path(self) -> Path:
        """Get the default path to fixture files"""
        current_file = Path(__file__)
        # Navigate to tests/fixtures/strava_responses from src/clients/
        return current_file.parent.parent.parent / "tests" / "fixtures" / "strava_responses"
    
    def _load_default_fixtures(self):
        """Load all available fixture files"""
        if self.fixtures_path.exists():
            for fixture_file in self.fixtures_path.glob("activity_*.json"):
                try:
                    # Extract activity ID from filename (e.g., "activity_12345_run.json" -> "12345")
                    filename = fixture_file.stem
                    parts = filename.split("_")
                    if len(parts) >= 2:
                        activity_id = parts[1]
                        
                        with open(fixture_file, 'r') as f:
                            fixture_data = json.load(f)
                        
                        self._activity_responses[activity_id] = fixture_data
                        
                except Exception as e:
                    print(f"Warning: Failed to load fixture {fixture_file}: {e}")
    
    def add_activity_response(self, activity_id: str, activity_data: Dict[str, Any]):
        """Manually add a mock response for testing"""
        self._activity_responses[activity_id] = activity_data
    
    def get_activity_details(self, activity_id: str) -> StravaActivity:
        """Return mock activity data"""
        if activity_id in self._activity_responses:
            activity_data = self._activity_responses[activity_id]
            return StravaActivity(**activity_data)
        
        # Return a default mock activity if no specific fixture exists
        default_activity = self._create_default_activity(activity_id)
        return StravaActivity(**default_activity)
    
    def _create_default_activity(self, activity_id: str) -> Dict[str, Any]:
        """Create a default mock activity for testing"""
        return {
            "id": int(activity_id),
            "resource_state": 3,
            "external_id": f"mock_activity_{activity_id}",
            "upload_id": 98765432123456789,
            "athlete": {
                "id": 134815,
                "resource_state": 1
            },
            "name": f"Mock Activity {activity_id}",
            "distance": 5240.2,
            "moving_time": 1847,
            "elapsed_time": 1932,
            "total_elevation_gain": 85.4,
            "type": "Run",
            "sport_type": "Run",
            "start_date": "2024-01-15T07:30:00Z",
            "start_date_local": "2024-01-14T23:30:00Z",
            "timezone": "(GMT-08:00) America/Los_Angeles",
            "utc_offset": -28800,
            "start_latlng": [37.7749, -122.4194],
            "end_latlng": [37.7749, -122.4194],
            "location_city": "San Francisco",
            "location_state": "California",
            "location_country": "United States",
            "achievement_count": 2,
            "kudos_count": 12,
            "comment_count": 3,
            "athlete_count": 1,
            "photo_count": 2,
            "map": {
                "id": f"a{activity_id}",
                "polyline": "ki{eFvqfiVqAWQIGEEKAYJgBVqDJ{BHa@jAkNJw@Pw@V{APs@^aABQAOEQGKoJ_FuJkFqAo@{A}@sH{DiAs@Q]?WVy@`@oBt@_CB]KYMMkB{AQEI@WT{BlE{@zAQPI@ICsCqA_BcAeCmAaFmCqIoEcLeG}KcG}A}@cDaBiDsByAkAuBqBi@y@_@o@o@kB}BgIoA_EUkAMcACa@BeBBq@LaAJe@b@uA`@_AdBcD",
                "resource_state": 3,
                "summary_polyline": "ki{eFvqfiVsBmA`Feh@qg@iX`B}JeCcCqGjIq~@kf@cM{KeHeX"
            },
            "trainer": False,
            "commute": False,
            "manual": False,
            "private": False,
            "flagged": False,
            "gear_id": "g12345678987654321",
            "from_accepted_tag": False,
            "average_speed": 2.84,
            "max_speed": 4.2,
            "average_cadence": 180.0,
            "average_temp": 18,
            "has_heartrate": True,
            "average_heartrate": 165.3,
            "max_heartrate": 184,
            "elev_high": 125.6,
            "elev_low": 40.2,
            "pr_count": 1,
            "total_photo_count": 2,
            "has_kudoed": False,
            "workout_type": None,
            "suffer_score": 85,
            "description": "Mock activity for testing purposes",
            "calories": 347.2,
            "device_name": "Garmin Forerunner 945",
            "embed_token": "mock_embed_token",
            "segment_leaderboard_opt_out": False,
            "leaderboard_opt_out": False,
            "splits_metric": [
                {
                    "distance": 1000.0,
                    "elapsed_time": 352,
                    "elevation_difference": 5.2,
                    "moving_time": 352,
                    "split": 1,
                    "average_speed": 2.84,
                    "pace_zone": 0
                }
            ],
            "laps": [
                {
                    "id": 4479306946,
                    "resource_state": 2,
                    "name": "Lap 1",
                    "activity": {
                        "id": int(activity_id),
                        "resource_state": 1
                    },
                    "athlete": {
                        "id": 134815,
                        "resource_state": 1
                    },
                    "elapsed_time": 1847,
                    "moving_time": 1847,
                    "start_date": "2024-01-15T07:30:00Z",
                    "start_date_local": "2024-01-14T23:30:00Z",
                    "distance": 5240.2,
                    "start_index": 0,
                    "end_index": 1847,
                    "total_elevation_gain": 85.4,
                    "average_speed": 2.84,
                    "max_speed": 4.2,
                    "average_cadence": 180.0,
                    "lap_index": 1,
                    "split": 1
                }
            ],
            "gear": {
                "id": "g12345678987654321",
                "primary": True,
                "name": "Nike Air Zoom Pegasus",
                "resource_state": 2,
                "distance": 485320
            },
            "partner_brand_tag": None,
            "photos": {
                "primary": {
                    "id": None,
                    "unique_id": "mock-photo-uuid",
                    "urls": {
                        "100": "https://example.com/photo-100.jpg",
                        "600": "https://example.com/photo-600.jpg"
                    },
                    "source": 1
                },
                "use_primary_photo": True,
                "count": 2
            },
            "highlighted_kudosers": [
                {
                    "destination_url": "strava://athletes/mock123",
                    "display_name": "Mock User",
                    "avatar_url": "https://example.com/avatar.jpg",
                    "show_name": True
                }
            ],
            "hide_from_home": False,
            "segment_efforts": []
        }
