from typing import Any, Optional
from pydantic import BaseModel

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: Any) -> dict:
        return {"success": True, "data": data, "error": None}

    @classmethod
    def fail(cls, error_msg: str, data: Any = None) -> dict:
        return {"success": False, "data": data, "error": error_msg}
