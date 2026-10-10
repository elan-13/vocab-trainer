# ReviewResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **int** |  | 
**word_id** | **int** |  | 
**score** | **int** |  | 
**review_date** | **datetime** |  | 

## Example

```python
from srs_sdk.models.review_response import ReviewResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ReviewResponse from a JSON string
review_response_instance = ReviewResponse.from_json(json)
# print the JSON string representation of the object
print(ReviewResponse.to_json())

# convert the object into a dict
review_response_dict = review_response_instance.to_dict()
# create an instance of ReviewResponse from a dict
review_response_from_dict = ReviewResponse.from_dict(review_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


