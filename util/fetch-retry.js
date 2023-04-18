export function fetchRetry(url, tries, fetchOptions = {}) {
    function onError(err){
        console.log("fetch error: ",err);
        if(tries <= 1){
            throw err;
        }
        console.log("retrying...")
        return fetchRetry(url, tries-1, fetchOptions);
    }
    return fetch(url,fetchOptions).catch(onError);
}
  