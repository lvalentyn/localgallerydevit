
// //JsStore connection
//it will be used to store the file being uploaded
// allowed extensions
let fileToUpload;
let title, imgtitle;
const connection = new JsStore.Instance();
const imageExtension = new Array(".jpg", ".jpeg", ".png", ".bmp");
const imageName = document.querySelector('.imageName');
const imageType = document.querySelector('.imageType');
const imageSize = document.querySelector('.imageSize');
const imageWidth = document.querySelector('.imageWidth');
const imageDate = document.querySelector('.imageDate');




window.onload = function () {
    initJsStore('GalleryStore');/* Название хранилища в IndexedDB */
    showAllImages();/* картинки для галлереи */
    registerEvents();/* кнопки */
    updateQuota();
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

// подключаем кнопки
function registerEvents() {

    $("#addImage").click(function () {
        title = $('#pub-title').val();
        saveImageToDB({
            Name: fileToUpload.name, /* используется для вывода изображения в превью */
            ImageContent: new Blob([fileToUpload]),
            ImageType: fileToUpload.type,
            ImageTitle: title


        }).then(function (rowsAffected) {
            rowsAffected > 0 && showAllImages();
            $("#imageToUploadOuter").hide();
            $("#inputImageUpload").val("");
            $('#pub-title').val('');
        });
        console.log(fileToUpload);
    });

    $("#cancelImage").click(function () {
        $("#imageToUploadOuter").hide();
        $("#imageToUpload").attr("src", "");
        $("#inputImageUpload").val("");
        $('#pub-title').val('');
    });

    $("#btnClearImages").click(function () {
        clearTable('ImageTable').
            then(function () {
                $("#carouselExampleInterval").hide();
                // $(".panel-body").html("<div style='text-align:center;font-size:16px;color:#777;'>No Image Found</div>");
                // $("#carouselExampleInterval .carousel-inner").html('<div class="carousel-item active" data-interval="10000"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_flag.svg/1280px-Black_flag.svg.png" class="d-block w-100" alt="\"></div>');
                $("#btnClearImages").hide();
            });
    });

}

// для кнопки удалить
function deleteImagefromDB(Id) {
    return connection.remove({
        From: "ImageTable",
        Where: {
            Images: Number(Id)
        }
    });
}
function changeTitle(Id, newTitle) {
    return connection.update({
        In: "ImageTable",
        Set: {
            ImageTitle: newTitle
        },
        Where: {
            Images: Number(Id)
        }
    });
}

/*функция для btnClearImages */
function clearTable(tableName) {
    return connection.clear(tableName)
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
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const height = img.naturalHeight;
                const width = img.naturalWidth;

                imageWidth.innerHTML = `Resolution: ${width}x${height}`;
            };
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
        imageName.innerHTML = `Name: ${fileToUpload.name}`;
        imageType.innerHTML = `Type: ${fileToUpload.type}`;
        imgS = (fileToUpload.size / 1000000).toFixed(2);
        imageSize.innerHTML = `Size: ${imgS} mb`;
        imageDate.innerHTML = `CreateDate: ${fileToUpload.lastModifiedDate}`;
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
            // $(".panel-body").html("");
            // if (images.length == 0) {
            //     $(".panel-body").html("<div style='text-align:center;font-size:16px;color:#777;'>No Image Found</div>");
            //     $("#btnClearImages").hide();
            // } else {
            //     images.forEach(function (image) {
            //         getImageUrlFromBlob(image.ImageContent).then(function (result) {
            //             $(".panel-body").prepend(`<div class="mini-img" data-id="${image.Images}"><img src="${result}"></div>`);
            //         });
            //     });
            //     $("#btnClearImages").show();
            // };
            $("#carouselExampleInterval .carousel-inner").html("");
            if (images.length == 0) {
                $("#carouselExampleInterval").hide('')
                $("#carouselExampleInterval .carousel-inner").html('')
                // $("#carouselExampleInterval .carousel-inner").html('<div class="carousel-item active" data-interval="10000"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_flag.svg/1280px-Black_flag.svg.png" class="d-block w-100" alt="\"></div>');
                // $("#btnClearImages").hide();
            }
            if (images.length == 1) {
                images.forEach(function (image) {
                    getImageUrlFromBlob(image.ImageContent).then(function (result) {
                        $("#carouselExampleInterval").show();
                        $("#carouselExampleInterval .carousel-inner").prepend(`<div class="carousel-item active" data-interval="10000" '>
                        <img src="${result}" class="d-block w-100" alt="${image.Name}">
                        <div class="imgButtons">
                            <a class="btnDelImg">
                            <i class="fas fa-trash-alt"></i>
                            </a>
                            <a href="${result}" download="${image.Name}" class="btnDownloadImg">
                            <i class="fas fa-file-download"></i>
                            </a>
                            <a id="btnTitleEdit${image.Images}" class="btnTitleEdit">
                            <i class="fas fa-edit"></i>
                            </a>
                            <a id="closeTitleBtn${image.Images}" class="closeTitleBtn" style="display:none;">
                            <i class="fas fa-window-close"></i>
                            </a>
                            <form id="title-change${image.Images}" class="title-change" style="display:none;">
                        <input id="title-change-input${image.Images}" type="text">
                        <button class="selectTitleBtn">
                        <i class="fas fa-check-square"></i>
                        </button>
                        <button class="delTitleBtn${image.Images} delTitleBtn">
                        <i class="fas fa-trash-alt"></i>
                        </button>
                        </form>
                        </div>
                        
                        <div class="img-title" id="img-title${image.Images}">${image.ImageTitle}</div>
                        </div>`);
                        $(".btnDelImg").click(function () {
                            deleteImagefromDB(image.Images);
                            window.location.reload();
                        })

                        $(`#closeTitleBtn${image.Images}`).click(function () {
                            $(`#title-change${image.Images}`).hide();
                            $(`#btnTitleEdit${image.Images}`).show();
                            $(`#closeTitleBtn${image.Images}`).hide();
                        });


                        $(`.delTitleBtn${image.Images}`).click(function () {
                            $(`#title-change${image.Images}`).hide();
                            let form = document.querySelector(`#title-change${image.Images}`);
                            form.reset();
                            $(`#btnTitleEdit${image.Images}`).show();
                            $(`#closeTitleBtn${image.Images}`).hide();
                        });

                        $(`#btnTitleEdit${image.Images}`).click(function () {
                            $(`#title-change${image.Images}`).show();
                            $(`#closeTitleBtn${image.Images}`).show();
                            $(`#btnTitleEdit${image.Images}`).hide();
                            let form = document.querySelector(`#title-change${image.Images}`);
                            form.addEventListener('submit', function (e) {
                                e.preventDefault();
                                let editTitle = document.querySelector(`#title-change-input${image.Images}`);
                                console.log(editTitle.value);
                                changeTitle(image.Images, editTitle.value);
                                newTtl = document.getElementById(`img-title${image.Images}`);
                                newTtl.innerHTML = editTitle.value;
                            });
                        });

                        $('.carousel-control-next').click(function () {
                            $(`.title-change`).hide();
                            $(`.closeTitleBtn`).hide();
                            $(`.btnTitleEdit`).show();
                        });
                        $('.carousel-control-prev').click(function () {
                            $(`.title-change`).hide();
                            $(`.closeTitleBtn`).hide();
                            $(`.btnTitleEdit`).show();
                        });

                    });
                });

            } else {
                images.forEach(function (image) {
                    getImageUrlFromBlob(image.ImageContent).then(function (result) {
                        $('.carousel-item').removeClass('active');

                        $("#carouselExampleInterval .carousel-inner").prepend(`<div class="carousel-item active" data-interval="10000"'>
                        <img src="${result}" class="d-block w-100" alt="${image.Name}">

                        <div class="imgButtons">
                            <a class="btnDelImg">
                            <i class="fas fa-trash-alt"></i>
                            </a>
                            <a href="${result}" download="${image.Name}" class="btnDownloadImg">
                            <i class="fas fa-file-download"></i>
                            </a>
                            <a id="btnTitleEdit${image.Images}" class="btnTitleEdit">
                            <i class="fas fa-edit"></i>
                            </a>
                            <a id="closeTitleBtn${image.Images}" class="closeTitleBtn" style="display:none;">
                            <i class="fas fa-window-close"></i>
                            </a>
                            <form id="title-change${image.Images}" class="title-change" style="display:none;">
                        <input id="title-change-input${image.Images}" type="text">
                        <button class="selectTitleBtn">
                        <i class="fas fa-check-square"></i>
                        </button>
                        <button class="delTitleBtn${image.Images}">
                        <i class="fas fa-trash-alt"></i>
                        </button>
                        </form>
                        </div>

                        
                        <div class="img-title" id="img-title${image.Images}">${image.ImageTitle}</div>
                        </div>`);


                        $(".btnDelImg").click(function () {
                            deleteImagefromDB(image.Images);
                            window.location.reload();
                        })

                        $(`#closeTitleBtn${image.Images}`).click(function () {
                            $(`#title-change${image.Images}`).hide();
                            $(`#btnTitleEdit${image.Images}`).show();
                            $(`#closeTitleBtn${image.Images}`).hide();
                        });


                        $(`.delTitleBtn${image.Images}`).click(function () {
                            $(`#title-change${image.Images}`).hide();
                            let form = document.querySelector(`#title-change${image.Images}`);
                            form.reset();
                            $(`#btnTitleEdit${image.Images}`).show();
                            $(`#closeTitleBtn${image.Images}`).hide();
                        });

                        $(`#btnTitleEdit${image.Images}`).click(function () {
                            $(`#title-change${image.Images}`).show();
                            $(`#closeTitleBtn${image.Images}`).show();
                            $(`#btnTitleEdit${image.Images}`).hide();
                            let form = document.querySelector(`#title-change${image.Images}`);
                            form.addEventListener('submit', function (e) {
                                e.preventDefault();
                                let editTitle = document.querySelector(`#title-change-input${image.Images}`);
                                console.log(editTitle.value);
                                changeTitle(image.Images, editTitle.value);
                                newTtl = document.getElementById(`img-title${image.Images}`);
                                newTtl.innerHTML = editTitle.value;
                            });
                        });

                        $('.carousel-control-next').click(function () {
                            $(`.title-change`).hide();
                            $(`.closeTitleBtn`).hide();
                            $(`.btnTitleEdit`).show();
                        });
                        $('.carousel-control-prev').click(function () {
                            $(`.title-change`).hide();
                            $(`.closeTitleBtn`).hide();
                            $(`.btnTitleEdit`).show();
                        });

                    });
                });
            };
        });
}

//   <img src="${result}" class="d-block w-100" alt="${image.Name}">
// <div class="carousel-item active" data-interval="10000" style="background:url(${result}) center center/cover no-repeat"'>


const elemQuota = document.getElementById('quota');
const elemUsed = document.getElementById('used');
const elemRemaining = document.getElementById('remaining');


function updateQuota() {
    navigator.storage.estimate().then((quota) => {
        const remaining = quota.quota - quota.usage;
        elemQuota.innerHTML = (quota.quota / 1000000).toFixed(2) + ' mb';
        elemUsed.innerHTML = (quota.usage / 1000000).toFixed(2) + ' mb';
        elemRemaining.innerHTML = (remaining / 1000000).toFixed(0) + ' mb';
    }).catch((err) => {
        console.error('*** Unable to update quota ***', err);
    }).then(() => {
        setTimeout(() => {
            updateQuota();
        }, 500);
    });

}


document.getElementById('buttClear').addEventListener('click', () => {
    clearAllStorage();
});
function clearAllStorage() {
    localStorage.clear();
    sessionStorage.clear();
    connection.dropDb().
        then(function () {
            initJsStore('GalleryStore');
            // $(".panel-body").html("<div style='text-align:center;font-size:16px;color:#777;'>No Image Found</div>");
            // $("#carouselExampleInterval .carousel-inner").html('<div class="carousel-item active" data-interval="10000"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Black_flag.svg/1280px-Black_flag.svg.png" class="d-block w-100" alt="\"></div>');
            $("#carouselExampleInterval").hide('')
            $("#btnClearImages").hide();
        });
};
