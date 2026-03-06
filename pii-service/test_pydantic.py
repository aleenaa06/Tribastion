class Dummy:
    A: int = 1
    B: str = "test"

print(getattr(Dummy, "__annotations__", "No annotations!"))
