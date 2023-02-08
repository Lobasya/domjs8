const debounce = (callback, time) => {
    let timerId = null;

    return (...args) => {
        if(timerId !== null) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            timerId = null;
            callback(...args);
        }, time)
    }
}