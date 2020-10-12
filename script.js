// //JsStore connection
var connection = new JsStore.Instance();
//it will be used to store the file being uploaded
var fileToUpload;
// allowed extensions
var imageExtension = new Array(".jpg", ".jpeg", ".png", ".bmp");


window.onload = function () {
    initJsStore('GalleryStore');/* Название хранилища в IndexedDB */
    showAllImages();/* картинки для галлереи */
    registerEvents();/* кнопки */
}


// подключаем кнопки
function registerEvents() {


    $("#addImage").click(function () {
        var title = $('#pub-title').val();
        saveImageToDB({
            Name: fileToUpload.name, /* используется для вывода изображения в превью */
            ImageContent: new Blob([fileToUpload]),
            ImageType: fileToUpload.type,
            ImageTitle: title
        }).then(function (rowsAffected) {
            rowsAffected > 0 && showAllImages();
            $("#imageToUploadOuter").hide();
            $("#inputImageUpload").val("");
        });
    });

    $("#cancelImage").click(function () {
        $("#imageToUploadOuter").hide();
        $("#imageToUpload").attr("src", "");
        $("#inputImageUpload").val("");
    });

    $("#btnClearImages").click(function () {
        clearTable('ImageTable').
            then(function () {
                $("#uploadedImageList .panel-body").html("<div style='text-align:center;font-size:16px;color:#777;'>No Image Found</div>");
                $("#carouselExampleInterval .carousel-inner").html('<div class="carousel-item active" data-interval="10000"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_flag.svg/1280px-Black_flag.svg.png" class="d-block w-100" alt="\"></div>');
                $("#btnClearImages").hide();
            });
    });

}

function deleteImagefromDB(Id) {
    return connection.remove({
        From: "ImageTable",
        Where: {
            Images: Number(Id)
        }
    });
}

/*функция для btnClearImages */
function clearTable(tableName) {
    return connection.clear(tableName)
}

// инициализация indexedDB ветки
function initJsStore(dbName) {
    JsStore.isDbExist(dbName).
        then(function (isExist) {
            if (isExist) {
                connection.openDb(dbName);
            } else {
                var db = getDBStructure(dbName);
                connection.createDb(db);
            }
        }).
        catch(function (err) {
            alert(err._message);
            console.log(err);
        });
}

// Создаем в хранилище GalleryStore таблицу ImageTable
function getDBStructure(dbName) {
    var tblImage = {
        Name: "ImageTable",
        Columns: [{
            Name: "Images",
            PrimaryKey: true,
            AutoIncrement: true
        }
        ]
    };
    return {
        Name: dbName,
        Tables: [tblImage]
    }
}

//сохранение картинок в таблицу ImageTable
function saveImageToDB(value) {
    return connection.insert({
        Into: "ImageTable",
        Values: [value]
    });
}



// вывод картинок из таблицы ImageTable
function getImages() {
    return connection.select({
        From: "ImageTable",
        Order: {
            By: 'Images'
        }
    });
}

// валидация загруженных файлов , только картинки будут попадать в базу
function isImageValid(file) {
    var isValid = false,
        fileName;
    if (file.files.length > 0) {
        fileName = file.files[0].name;
        imageExtension.every(function (item) {
            if (fileName.indexOf(item) >= 0) {
                isValid = true;
                return false;
            }
            return true;
        });
    }
    return isValid;
}


// получение картинки из BLOB
function getImageUrlFromBlob(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ' + error);
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

//получаем файл через инпут, если картинка то отправляем в превью
function uploadImage(file) {
    if (isImageValid(file)) {
        fileToUpload = file.files[0];
        previewOfImageToUpload();
    } else {
        alert('not img')
    }
}

// поле превью получаем картинку из базы и отобржаем
function previewOfImageToUpload() {
    $("#imageToUploadOuter").show();
    // вытягиваем путь к файлу
    getImageUrlFromBlob(fileToUpload).
        then(function (result) {
            // даем атрибуту src путь к локальному файлу
            $('#imageToUpload').attr('src', result);
        });
}
// вывод картинок в галлерею
function showAllImages() {
    getImages().
        then(function (images) {
            $("#uploadedImageList .panel-body").html("");
            if (images.length == 0) {
                $("#uploadedImageList .panel-body").html("<div style='text-align:center;font-size:16px;color:#777;'>No Image Found</div>");
                $("#btnClearImages").hide();
            } else {
                images.forEach(function (image) {
                    getImageUrlFromBlob(image.ImageContent).then(function (result) {
                        $("#uploadedImageList .panel-body").prepend('<div class="mini-img" data-id="' + image.Images + '"><img src="' + result + '" /></div>');
                    });
                });
                $("#btnClearImages").show();
            };

            $("#carouselExampleInterval .carousel-inner").html("");
            if (images.length == 0) {
                $("#carouselExampleInterval .carousel-inner").html('<div class="carousel-item active" data-interval="10000"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_flag.svg/1280px-Black_flag.svg.png" class="d-block w-100" alt="\"></div>');
                // $("#btnClearImages").hide();
            }
            if (images.length == 1) {
                images.forEach(function (image) {
                    getImageUrlFromBlob(image.ImageContent).then(function (result) {
                        $("#carouselExampleInterval .carousel-inner").append('<div class="carousel-item active" data-interval="10000"><a class="btnDelImg">Delete</a><a href="' + result + '" download="' + image.Name + '" class="btnDownloadImg">Download</a><div class="img-title">' + image.ImageTitle + '</div><img src="' + result + '" class="d-block w-100" alt="' + image.Name + '"></div>');
                        $(".btnDelImg").click(function () {
                            deleteImagefromDB(image.Images);
                        })
                    });
                });

            } else {
                images.forEach(function (image) {
                    getImageUrlFromBlob(image.ImageContent).then(function (result) {
                        $('.carousel-item').removeClass('active');
                        $("#carouselExampleInterval .carousel-inner").prepend('<div class="carousel-item active" data-interval="10000"><a class="btnDelImg">Delete</a><a href="' + result + '" download="' + image.Name + '"  class="btnDownloadImg">Download</a><div class="img-title">' + image.ImageTitle + '</div><img src="' + result + '" class="d-block w-100" alt="' + image.Name + '"></div>');
                        $(".btnDelImg").click(function () {
                            deleteImagefromDB(image.Images);
                        })
                    });
                });
            };
        });
}



