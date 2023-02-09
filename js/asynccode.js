const input = document.querySelector('input');
const img = document.querySelector('img');

const convertFileToBase64 = (file) => {
    return new Promise((res, rej) => {
        const fileReader = new FileReader();
        fileReader.onload = () => res(fileReader);
        fileReader.onerror = (err) => rej(err);
        fileReader.readAsDataURL(file);
    });
}

const asyncFunc = async (files) => {
    const arr = []
    for(const file of files) {
        const result = await convertFileToBase64(file)
        arr.push(result)
    }
    console.log(arr)
    return arr
}


input.onchange = () => {
    const files = input.files;

    asyncFunc(files)

    console.log('input end')
    for(let i = 0; i <= 1e9; i++){
        if(i === 1e9) console.log(i)
    }
}




