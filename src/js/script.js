let fileToUpload, title, tblImage, db, isValid, fileName, reader, height, width, orient, createDate, imgDate;
const connection = new JsStore.Instance(),
    imageExtension = new Array(".jpg", ".jpeg", ".png", ".bmp"),
    imageName = document.querySelector('.imageName'),
    imageType = document.querySelector('.imageType'),
    imageSize = document.querySelector('.imageSize'),
    imageWidth = document.querySelector('.imageWidth'),
    imageDate = document.querySelector('.imageDate'),
    imageOrientation = document.querySelector('.imageOrientation'),
    elemQuota = document.getElementById('quota'),
    elemUsed = document.getElementById('used'),
    elemRemaining = document.getElementById('remaining');

window.onload = function () {
    initJsStore('GalleryStore');/* Название хранилища в IndexedDB */
    showAllImages();/* картинки для галлереи */
    registerEvents();/* событие сохраняем картинку, добавляем свойства  */
}



// инициализация indexedDB ветки
function initJsStore(dbName) {
    JsStore.isDbExist(dbName).
        then(function (isExist) {
            if (isExist) {
                connection.openDb(dbName);
            } else {
                db = getDBStructure(dbName);
                connection.createDb(db);
            }
        }).
        catch(function (err) {
            alert(err._message);
            console.log(err);
        });
}
/* событие сохраняем картинку, добавляем свойства  */
function registerEvents() {


    $("#addImage").click(function () {
        descr = $('#img_descr').val();


        saveImageToDB({
            Name: fileToUpload.name,
            ImageContent: new Blob([fileToUpload]),
            ImageType: fileToUpload.type,
            ImageSize: fileToUpload.size,
            ImageWidth: width,
            ImageHeight: height,
            ImageOrientation: orient,
            ImageDate: imgDate,
            ImageDescr: descr


        }).then(function (rowsAffected) {
            rowsAffected > 0 && showAllImages();
            $("#imageToUploadOuter").hide();
            $("#inputImageUpload").val("");
            $('#img_descr').val('');
        });
        console.log(fileToUpload);
    });

    $("#cancelImage").click(function () {
        $("#imageToUploadOuter").hide();
        $("#imageToUpload").attr("src", "");
        $("#inputImageUpload").val("");
        $('#img_descr').val('');
    });

    $("#btnClearImages").click(function () {
        clearTable('ImageTable').
            then(function () {
                $(".carousel-wrapper").hide();
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

/* Edit Btn */
function changeTitle(Id, newDescr) {
    return connection.update({
        In: "ImageTable",
        Set: {
            ImageDescr: newDescr
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
    tblImage = {
        Name: "ImageTable",
        Columns: [{
            Name: "Images",
            PrimaryKey: true,
            AutoIncrement: true
        }]
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
    isValid = false;
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
        reader = new FileReader();
        reader.onload = function (e) {
            resolve(e.target.result);
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                height = img.naturalHeight;
                width = img.naturalWidth;

                imageWidth.innerHTML = `<span class="metaField">Resolution:</span> ${width}x${height}`;
                if (width > height) {
                    orient = 'landscape';
                    imageOrientation.innerHTML = `<span class="metaField">Orientation:</span> ${orient}`;
                } else if (height > width) {
                    orient = 'portrait';
                    imageOrientation.innerHTML = `<span class="metaField">Orientation:</span> ${orient}`;
                } else {
                    orient = 'square';
                    imageOrientation.innerHTML = `<span class="metaField">Orientation:</span> ${orient}`;
                }

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
        createDate = new Date(fileToUpload.lastModifiedDate); // инициализируем переменную текущей датой
        imgDate = createDate.toISOString(); // преобразуем дату в строку в формате ISO 8601

        imageName.innerHTML = `<span class="metaField">Name: </span> ${fileToUpload.name}`;
        imageType.innerHTML = `<span class="metaField">Type: </span> .${fileToUpload.type.substr(6)}`;
        imgS = (fileToUpload.size / 1000000).toFixed(2);
        imageSize.innerHTML = `<span class="metaField">Size: </span> ${imgS} mb`;
        imageDate.innerHTML = `<span class="metaField">CreateDate: </span> ${createDate}`;


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

// вводим контент в документ
function showAllImages() {
    getImages().
        then(function (images) {
            $(".carousel-wrapper .carousel-inner").html("");
            if (images.length == 0) {
                $(".carousel-wrapper").hide('')
                $(".carousel-wrapper .carousel-inner").html('')
                $("#btnClearImages").hide();
            }
            if (images.length == 1) {
                images.forEach(function (image) {
                    getImageUrlFromBlob(image.ImageContent).then(function (result) {
                        $(".carousel-wrapper").show();
                        $(".carousel-wrapper .carousel-inner").prepend(`

                        <div class="carousel-item active" data-interval="10000" '>
                            <img src="${result}" class="d-block w-100" alt="${image.Name}">
                            <div class="imgButtons">
                                <a class="btnDelImg${image.Images} btnDelImg">
                                <i class="fas fa-trash-alt imageicon"></i>
                                </a>
                                <a href="${result}" download="${image.Name}" class="btnDownloadImg">
                                <i class="fas fa-file-download imageicon"></i>
                                </a>
                                <a id="btnTitleEdit${image.Images}" class="btnTitleEdit">
                                <i class="fas fa-edit imageicon"></i>
                                </a>
                                <a id="closeTitleBtn${image.Images}" class="closeTitleBtn" style="display:none;">
                                <i class="fas fa-window-close imageicon"></i>
                                </a>
                                <form id="title-change${image.Images}" class="title-change" style="display:none;">
                                    <input maxlength='30' id="title-change-input${image.Images}" class="title-change-input" type="text">
                                    <button class="selectTitleBtn">
                                    <i class="fas fa-check-square"></i>
                                    </button>
                                    <button class="delTitleBtn${image.Images} delTitleBtn">
                                    <i class="fas fa-trash-alt"></i>
                                    </button>
                                </form>
                            </div>
                            <div class="img-title" id="img-title${image.Images}">${image.ImageDescr}</div>
                        </div>
                            
                            `);
                        $("#btnClearImages").show();

                        $(`.btnDelImg${image.Images}`).click(function () {
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
                        $(".carousel-wrapper").show();
                        $('.carousel-item').removeClass('active');
                        $(".carousel-wrapper .carousel-inner").prepend(`

                        <div class="carousel-item active" data-interval="10000"'>
                            <img src="${result}" class="d-block w-100" alt="${image.Name}">

                            <div class="imgButtons">
                                <a class="btnDelImg${image.Images} btnDelImg">
                                <i class="fas fa-trash-alt imageicon"></i>
                                </a>
                                <a href="${result}" download="${image.Name}" class="btnDownloadImg">
                                <i class="fas fa-file-download imageicon"></i>
                                </a>
                                <a id="btnTitleEdit${image.Images}" class="btnTitleEdit">
                                <i class="fas fa-edit imageicon"></i>
                                </a>
                                <a id="closeTitleBtn${image.Images}" class="closeTitleBtn" style="display:none;">
                                <i class="fas fa-window-close imageicon"></i>
                                </a>
                                <form id="title-change${image.Images}" class="title-change" style="display:none;">
                                    <input maxlength='30' id="title-change-input${image.Images}" class="title-change-input" type="text">
                                    <button class="selectTitleBtn">
                                    <i class="fas fa-check-square"></i>
                                    </button>
                                    <button class="delTitleBtn${image.Images} delTitleBtn">
                                    <i class="fas fa-trash-alt"></i>
                                    </button>
                                </form>
                            </div>
                        
                            <div class="img-title" id="img-title${image.Images}">${image.ImageDescr}</div>
                        </div>
                        
                        `);

                        $(`.btnDelImg${image.Images}`).click(function () {
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

/* хранилище занято/доступно/всего  */

function updateQuota() {
    navigator.storage.estimate().then((quota) => {
        const remaining = quota.quota - quota.usage;
        elemQuota.innerHTML = (quota.quota / 1000000).toFixed(2) + ' mb';
        elemUsed.innerHTML = (quota.usage / 1000000).toFixed(2) + ' mb';
        elemRemaining.innerHTML = (remaining / 1000000).toFixed(2) + ' mb';
    }).catch((err) => {
        console.error('*** Unable to update quota ***', err);
    }).then(() => {
        setTimeout(() => {
            updateQuota();
        }, 500);
    });

}
updateQuota();
/*полная очистка хранилища  */
document.getElementById('btnClearStorage').addEventListener('click', () => {
    clearAllStorage();
});
function clearAllStorage() {
    localStorage.clear();
    // sessionStorage.clear();
    connection.dropDb().
        then(function () {
            initJsStore('GalleryStore');
            $(".carousel-wrapper").hide('')
            $("#btnClearImages").hide();
        });
};
    /* /хранилище занято/доступно/всего  */
