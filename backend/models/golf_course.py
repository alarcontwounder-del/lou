from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timezone


class GolfCourseBase(BaseModel):
    """Base model for golf course data"""
    name: str
    description: Dict[str, str]  # Multi-language: {"en": "...", "de": "...", "fr": "...", "se": "..."}
    image: str
    holes: int
    par: int
    price_from: Optional[float] = None
    location: str
    full_address: Optional[str] = None
    phone: Optional[str] = None
    features: List[str] = []
    booking_url: str


class GolfCourseCreate(GolfCourseBase):
    """Model for creating a new golf course"""
    id: str  # Slug-like identifier (e.g., "golf-alcanada")


class GolfCourse(GolfCourseBase):
    """Full golf course model with metadata"""
    id: str
    is_active: bool = True
    display_order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class GolfCourseUpdate(BaseModel):
    """Model for updating a golf course (all fields optional)"""
    name: Optional[str] = None
    description: Optional[Dict[str, str]] = None
    image: Optional[str] = None
    holes: Optional[int] = None
    par: Optional[int] = None
    price_from: Optional[float] = None
    location: Optional[str] = None
    full_address: Optional[str] = None
    phone: Optional[str] = None
    features: Optional[List[str]] = None
    booking_url: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class GolfCourseResponse(BaseModel):
    """Response model for API (excludes internal fields like _id)"""
    id: str
    name: str
    description: Dict[str, str]
    image: str
    holes: int
    par: int
    price_from: Optional[float] = None
    location: str
    full_address: Optional[str] = None
    phone: Optional[str] = None
    features: List[str] = []
    booking_url: str
    is_active: bool = True
    display_order: int = 0
