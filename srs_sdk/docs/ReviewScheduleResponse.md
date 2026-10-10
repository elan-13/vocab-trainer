# ReviewScheduleResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**new_repetition** | **int** |  | 
**new_interval** | **int** |  | 
**new_easiness_factor** | **float** |  | 
**next_review** | **datetime** |  | 

## Example

```python
from srs_sdk.models.review_schedule_response import ReviewScheduleResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ReviewScheduleResponse from a JSON string
review_schedule_response_instance = ReviewScheduleResponse.from_json(json)
# print the JSON string representation of the object
print(ReviewScheduleResponse.to_json())

# convert the object into a dict
review_schedule_response_dict = review_schedule_response_instance.to_dict()
# create an instance of ReviewScheduleResponse from a dict
review_schedule_response_from_dict = ReviewScheduleResponse.from_dict(review_schedule_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


