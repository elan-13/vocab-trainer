# srs_sdk.WordsApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_word**](WordsApi.md#create_word) | **POST** /words/ | Create Word
[**delete_word**](WordsApi.md#delete_word) | **DELETE** /words/{word_id} | Delete Word
[**get_due_words**](WordsApi.md#get_due_words) | **GET** /words/due/ | Get Due Words
[**get_history**](WordsApi.md#get_history) | **GET** /words/history/ | Get History
[**get_upcoming_words**](WordsApi.md#get_upcoming_words) | **GET** /words/upcoming/ | Get Upcoming Words
[**review_word**](WordsApi.md#review_word) | **POST** /words/{word_id}/review/ | Review Word


# **create_word**
> WordResponse create_word(word_create)

Create Word

### Example


```python
import srs_sdk
from srs_sdk.models.word_create import WordCreate
from srs_sdk.models.word_response import WordResponse
from srs_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = srs_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with srs_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = srs_sdk.WordsApi(api_client)
    word_create = srs_sdk.WordCreate() # WordCreate | 

    try:
        # Create Word
        api_response = api_instance.create_word(word_create)
        print("The response of WordsApi->create_word:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WordsApi->create_word: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **word_create** | [**WordCreate**](WordCreate.md)|  | 

### Return type

[**WordResponse**](WordResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **delete_word**
> delete_word(word_id)

Delete Word

### Example


```python
import srs_sdk
from srs_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = srs_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with srs_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = srs_sdk.WordsApi(api_client)
    word_id = 56 # int | 

    try:
        # Delete Word
        api_instance.delete_word(word_id)
    except Exception as e:
        print("Exception when calling WordsApi->delete_word: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **word_id** | **int**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**204** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_due_words**
> List[WordResponse] get_due_words()

Get Due Words

### Example


```python
import srs_sdk
from srs_sdk.models.word_response import WordResponse
from srs_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = srs_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with srs_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = srs_sdk.WordsApi(api_client)

    try:
        # Get Due Words
        api_response = api_instance.get_due_words()
        print("The response of WordsApi->get_due_words:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WordsApi->get_due_words: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**List[WordResponse]**](WordResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_history**
> HistoryResponse get_history(limit=limit, offset=offset)

Get History

### Example


```python
import srs_sdk
from srs_sdk.models.history_response import HistoryResponse
from srs_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = srs_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with srs_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = srs_sdk.WordsApi(api_client)
    limit = 50 # int |  (optional) (default to 50)
    offset = 0 # int |  (optional) (default to 0)

    try:
        # Get History
        api_response = api_instance.get_history(limit=limit, offset=offset)
        print("The response of WordsApi->get_history:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WordsApi->get_history: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int**|  | [optional] [default to 50]
 **offset** | **int**|  | [optional] [default to 0]

### Return type

[**HistoryResponse**](HistoryResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_upcoming_words**
> List[WordResponse] get_upcoming_words(limit=limit, offset=offset)

Get Upcoming Words

### Example


```python
import srs_sdk
from srs_sdk.models.word_response import WordResponse
from srs_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = srs_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with srs_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = srs_sdk.WordsApi(api_client)
    limit = 50 # int |  (optional) (default to 50)
    offset = 0 # int |  (optional) (default to 0)

    try:
        # Get Upcoming Words
        api_response = api_instance.get_upcoming_words(limit=limit, offset=offset)
        print("The response of WordsApi->get_upcoming_words:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WordsApi->get_upcoming_words: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **int**|  | [optional] [default to 50]
 **offset** | **int**|  | [optional] [default to 0]

### Return type

[**List[WordResponse]**](WordResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **review_word**
> ReviewScheduleResponse review_word(word_id, review_create)

Review Word

### Example


```python
import srs_sdk
from srs_sdk.models.review_create import ReviewCreate
from srs_sdk.models.review_schedule_response import ReviewScheduleResponse
from srs_sdk.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = srs_sdk.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with srs_sdk.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = srs_sdk.WordsApi(api_client)
    word_id = 56 # int | 
    review_create = srs_sdk.ReviewCreate() # ReviewCreate | 

    try:
        # Review Word
        api_response = api_instance.review_word(word_id, review_create)
        print("The response of WordsApi->review_word:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WordsApi->review_word: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **word_id** | **int**|  | 
 **review_create** | [**ReviewCreate**](ReviewCreate.md)|  | 

### Return type

[**ReviewScheduleResponse**](ReviewScheduleResponse.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

