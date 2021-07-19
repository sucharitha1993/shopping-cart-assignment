/*
 * Returns a promise contaning the response
 *
 * @param {url} API END POINT URI.
 */
function getData(url) {
    return fetch(url).then(res => res.json());
}

/*
 * Returns a promise contaning the response
 *
 * @param {url} API END POINT URI.
 * @param {data} Which we will be sending it to server to save/update.
 */
function postData(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data
    }).then(res => res.json())
}