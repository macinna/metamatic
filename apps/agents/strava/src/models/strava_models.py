from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class StravaAthlete(BaseModel):
    """Strava athlete summary representation"""
    id: int
    resource_state: int


class StravaMap(BaseModel):
    """Strava activity map data"""
    id: str
    polyline: Optional[str] = None
    resource_state: int
    summary_polyline: Optional[str] = None


class StravaGear(BaseModel):
    """Strava gear (shoes, bike) representation"""
    id: str
    primary: bool
    name: str
    resource_state: int
    distance: int


class StravaPhotoUrls(BaseModel):
    """Photo URLs in different sizes"""
    one_hundred: str = Field(alias="100")
    six_hundred: str = Field(alias="600")


class StravaPhoto(BaseModel):
    """Individual photo data"""
    id: Optional[int] = None
    unique_id: str
    urls: StravaPhotoUrls
    source: int


class StravaPhotos(BaseModel):
    """Photos attached to activity"""
    primary: Optional[StravaPhoto] = None
    use_primary_photo: bool
    count: int


class StravaKudoser(BaseModel):
    """Athlete who gave kudos"""
    destination_url: str
    display_name: str
    avatar_url: str
    show_name: bool


class StravaSplitMetric(BaseModel):
    """Activity split data (per km/mile)"""
    distance: float
    elapsed_time: int
    elevation_difference: float
    moving_time: int
    split: int
    average_speed: float
    pace_zone: int


class StravaLap(BaseModel):
    """Activity lap data"""
    id: int
    resource_state: int
    name: str
    activity: StravaAthlete  # Simplified reference
    athlete: StravaAthlete
    elapsed_time: int
    moving_time: int
    start_date: datetime
    start_date_local: datetime
    distance: float
    start_index: int
    end_index: int
    total_elevation_gain: float
    average_speed: float
    max_speed: float
    average_cadence: Optional[float] = None
    lap_index: int
    split: int


class StravaActivity(BaseModel):
    """Complete Strava activity representation matching API v3"""
    # Core identification
    id: int
    resource_state: int
    external_id: Optional[str] = None
    upload_id: Optional[int] = None
    athlete: StravaAthlete

    # Basic info
    name: str
    distance: float  # meters
    moving_time: int  # seconds
    elapsed_time: int
    total_elevation_gain: float
    type: str
    sport_type: str

    # Timing
    start_date: datetime
    start_date_local: datetime
    timezone: str
    utc_offset: int

    # Location
    start_latlng: Optional[List[float]] = None
    end_latlng: Optional[List[float]] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None

    # Social/engagement
    achievement_count: int
    kudos_count: int
    comment_count: int
    athlete_count: int
    photo_count: int

    # Map data
    map: StravaMap

    # Activity settings
    trainer: bool
    commute: bool
    manual: bool
    private: bool
    flagged: bool
    gear_id: Optional[str] = None
    from_accepted_tag: Optional[bool] = None

    # Performance metrics
    average_speed: float  # m/s
    max_speed: float
    average_cadence: Optional[float] = None
    average_temp: Optional[int] = None
    has_heartrate: bool = False
    average_heartrate: Optional[float] = None
    max_heartrate: Optional[int] = None
    elev_high: Optional[float] = None
    elev_low: Optional[float] = None

    # Achievements and social
    pr_count: int
    total_photo_count: int
    has_kudoed: bool
    workout_type: Optional[int] = None
    suffer_score: Optional[int] = None
    description: Optional[str] = None
    calories: Optional[float] = None

    # Device and metadata
    device_name: Optional[str] = None
    embed_token: Optional[str] = None
    segment_leaderboard_opt_out: bool = False
    leaderboard_opt_out: bool = False

    # Detailed breakdowns
    splits_metric: List[StravaSplitMetric] = []
    laps: List[StravaLap] = []
    gear: Optional[StravaGear] = None
    partner_brand_tag: Optional[str] = None
    photos: Optional[StravaPhotos] = None
    highlighted_kudosers: List[StravaKudoser] = []
    hide_from_home: bool = False
    segment_efforts: List = []  # Simplified for now

    class Config:
        # Allow parsing datetime strings automatically
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        # Allow population by field name or alias
        allow_population_by_field_name = True
