try:
    import pydantic.v1.fields
    original_set_default_and_type = pydantic.v1.fields.ModelField._set_default_and_type
    def patched_set_default_and_type(self):
        try:
            original_set_default_and_type(self)
        except Exception as e:
            if "unable to infer type for attribute" in str(e):
                from typing import Any
                self.type_ = Any
                self.outer_type_ = Any
                self.annotation = Any
                self.required = False
            else:
                raise
    pydantic.v1.fields.ModelField._set_default_and_type = patched_set_default_and_type
except ImportError:
    pass

import spacy
print("Spacy imported successfully")
