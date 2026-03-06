class Meta(type):
    def __new__(mcs, name, bases, namespace, **kwargs):
        print(f"Meta namespace keys: {list(namespace.keys())}")
        if '__annotations__' in namespace:
            print("Annotations in namespace:", namespace['__annotations__'])
        else:
            print("NO ANNOTATIONS IN NAMESPACE!")
        return super().__new__(mcs, name, bases, namespace, **kwargs)

class Dummy(metaclass=Meta):
    __annotations__ = {"REGEX": int}
    REGEX: int = 1

