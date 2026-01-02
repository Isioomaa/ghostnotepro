from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

import os

# Use /tmp for SQLite on Vercel because the root filesystem is read-only
if os.environ.get("VERCEL"):
    DATABASE_URL = "sqlite+aiosqlite:////tmp/ghostnote.db"
else:
    DATABASE_URL = "sqlite+aiosqlite:///./ghostnote.db"

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
