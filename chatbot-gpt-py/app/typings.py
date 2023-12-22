from pydantic import BaseModel

class UserQuery(BaseModel):
    message: str | None = None
