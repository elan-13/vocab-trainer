# srs_sdk.DefaultApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**force_app_error_force_app_error_get**](DefaultApi.md#force_app_error_force_app_error_get) | **GET** /force-app-error | Force App Error
[**force_error_force_error_get**](DefaultApi.md#force_error_force_error_get) | **GET** /force-error | Force Error
[**read_root_get**](DefaultApi.md#read_root_get) | **GET** / | Read Root


# **force_app_error_force_app_error_get**
> object force_app_error_force_app_error_get()

Force App Error

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
    api_instance = srs_sdk.DefaultApi(api_client)

    try:
        # Force App Error
        api_response = api_instance.force_app_error_force_app_error_get()
        print("The response of DefaultApi->force_app_error_force_app_error_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->force_app_error_force_app_error_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

**object**

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

# **force_error_force_error_get**
> object force_error_force_error_get()

Force Error

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
    api_instance = srs_sdk.DefaultApi(api_client)

    try:
        # Force Error
        api_response = api_instance.force_error_force_error_get()
        print("The response of DefaultApi->force_error_force_error_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->force_error_force_error_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

**object**

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

# **read_root_get**
> object read_root_get()

Read Root

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
    api_instance = srs_sdk.DefaultApi(api_client)

    try:
        # Read Root
        api_response = api_instance.read_root_get()
        print("The response of DefaultApi->read_root_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DefaultApi->read_root_get: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

**object**

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

