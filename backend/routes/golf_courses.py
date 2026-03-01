from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone
from models.golf_course import (
    GolfCourse,
    GolfCourseCreate,
    GolfCourseUpdate,
    GolfCourseResponse
)

router = APIRouter(prefix="/golf-courses", tags=["Golf Courses"])

# Database reference will be injected
db = None

def init_db(database):
    """Initialize the database reference"""
    global db
    db = database


def golf_doc_to_response(doc: dict) -> dict:
    """Convert MongoDB document to response format (removes _id)"""
    if doc is None:
        return None
    # Remove MongoDB _id field
    doc.pop("_id", None)
    return doc


@router.get("", response_model=List[GolfCourseResponse])
async def get_all_golf_courses():
    """Get all active golf courses, ordered by display_order"""
    cursor = db.golf_courses.find(
        {"is_active": True},
        {"_id": 0}  # Exclude _id from results
    ).sort("display_order", 1)
    
    courses = await cursor.to_list(length=100)
    return courses


@router.get("/{course_id}", response_model=GolfCourseResponse)
async def get_golf_course(course_id: str):
    """Get a specific golf course by ID"""
    course = await db.golf_courses.find_one(
        {"id": course_id},
        {"_id": 0}
    )
    if not course:
        raise HTTPException(status_code=404, detail="Golf course not found")
    return course


@router.post("", response_model=GolfCourseResponse, status_code=201)
async def create_golf_course(course: GolfCourseCreate):
    """Create a new golf course (admin only)"""
    # Check if course with same ID already exists
    existing = await db.golf_courses.find_one({"id": course.id})
    if existing:
        raise HTTPException(status_code=400, detail="Golf course with this ID already exists")
    
    # Create the full course document
    now = datetime.now(timezone.utc)
    course_doc = {
        **course.model_dump(),
        "is_active": True,
        "display_order": 0,
        "created_at": now,
        "updated_at": now
    }
    
    await db.golf_courses.insert_one(course_doc)
    
    # Return without _id
    course_doc.pop("_id", None)
    return course_doc


@router.put("/{course_id}", response_model=GolfCourseResponse)
async def update_golf_course(course_id: str, course_update: GolfCourseUpdate):
    """Update an existing golf course (admin only)"""
    # Check if course exists
    existing = await db.golf_courses.find_one({"id": course_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Golf course not found")
    
    # Build update dict with only provided fields
    update_data = {k: v for k, v in course_update.model_dump().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        await db.golf_courses.update_one(
            {"id": course_id},
            {"$set": update_data}
        )
    
    # Return updated course
    updated = await db.golf_courses.find_one({"id": course_id}, {"_id": 0})
    return updated


@router.delete("/{course_id}", status_code=204)
async def delete_golf_course(course_id: str):
    """Soft delete a golf course (sets is_active to False)"""
    result = await db.golf_courses.update_one(
        {"id": course_id},
        {"$set": {"is_active": False, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Golf course not found")
    return None


@router.post("/reorder", status_code=200)
async def reorder_golf_courses(course_ids: List[str]):
    """Reorder golf courses by updating display_order (admin only)"""
    for index, course_id in enumerate(course_ids):
        await db.golf_courses.update_one(
            {"id": course_id},
            {"$set": {"display_order": index, "updated_at": datetime.now(timezone.utc)}}
        )
    return {"message": "Courses reordered successfully"}
