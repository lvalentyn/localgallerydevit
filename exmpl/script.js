// let openRequest = indexedDB.open("gallery", 1);
// openRequest.onupgradeneeded = function () {
// };
// openRequest.onerror = function () {
//     console.error("Error", openRequest.error);
// };

// openRequest.onsuccess = function () {
//     let db = openRequest.result;
//     db.onversionchange = function () {
//         db.close();
//         alert("База данных устарела, пожалуста, перезагрузите страницу.")
//     };
//     // продолжить работу с базой данных, используя объект db
// };
// openRequest.onblocked = function () {
//     // есть другое соединение к той же базе
//     // и оно не было закрыто после срабатывания на нём db.onversionchange
// };

// db.createObjectStore('images', {
//     keyPath: id
// });



let openRequest = indexedDB.open("gallery", 1);

// создаём хранилище объектов для books, если ешё не существует
openRequest.onupgradeneeded = function () {
    let db = openRequest.result;
    if (!db.objectStoreNames.contains('images')) { // если хранилище "books" не существует
        db.createObjectStore('images', { keyPath: 'id' }); // создаем хранилище
    }
};

// let transaction = images.transaction("images", "readwrite");
// let images = transaction.objectStore("images");
// let image = {
//     id: 'js',
//     price: 10,
//     created: new Date()
// };

// let request = images.add(image);

// request.onsuccess = function () {
//     console.log("Изображение добавлено в хранилище", request.result);
// };

// request.onerror = function () {
//     console.log("Ошибка", request.error);
// };