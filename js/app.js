'use strict';
/* ----- ANGULAR CODES ----- */
angular.module('phostery', ['ngTouch'])
// App Controller
.controller('appController', ['$scope','$location',
    function($scope, $location) {
        $scope.name = 'My Album';
        $scope.images = [];
        $scope.selectedPhotosByIndex = [];
        $scope.shareLink = 'http://phostery.github.io/';
        $scope.totalRepeat = 3;

        // Some basic global variables
        var i, j, l, equal, code;

        /* ----- GENERAL FUNCTIONS ----- */
        /**
         *  Add one image to the array and displays it at the container
         *  @param {string} The link of the image that will be added
         */
        $scope.addItem = function(imgUrl) {
            // If the image is new, add to the album
            if (!hasUrl(imgUrl)) {
                $scope.images.push({
                    url: imgUrl
                });
                snackbar('Image added on album');
            } else {
                snackbar('Image already exist.');
            }

            // If not editing a shared Url, do cache
            if (code[1] === false) {
                setItem('images', JSON.stringify($scope.images, function(key, val) {
                    if (key == '$$hashKey') {
                        return undefined;
                    }
                    return val;
                }));
            }
        };

        /**
         *  Check on the array images if the url is not added yet
         *  @param {string} The url to look for in the array
         *  @return {boolean} if it's alredy exist or not
         */
        function hasUrl(link) {
            for (i = 0; i < $scope.images.length; i++) {
                if ($scope.images[i].url == link) {
                    return true;
                }
            }

            return false;
        }

        /**
         *  Remove one image to the array and from the container
         *  @param {int} The index of the item that will be removed
         */
        $scope.removeItem = function(index) {
            $scope.images.splice(index, 1);
            // If not editing a shared Url, do cache
            if (code[1] === false) {
                setItem('images', JSON.stringify($scope.images, function(key, val) {
                    if (key == '$$hashKey') {
                        return undefined;
                    }
                    return val;
                }));
            }
        };

        /**
         *  Change the name of the album and save it on the cache
         *  @param {String} The new name of the album
         */
        $scope.changeName = function(nome) {
            // Check ift's not empty
            $scope.name = nome;
            // If not editing a shared Url, do cache
            if (code[0] === false) {
                setItem('name', nome);
            }
        };

        /**
         *  Load more photos of the album. It should prevent to load everything at once
         */
        $scope.loadMore = function() {
            $scope.totalRepeat += 3;
            $scope.images = $scope.images;
        };

        /**
         *  Clear all the cache data from the localStorage and reload the page
         */
        $scope.reset = function() {
            removeItem('images');
            removeItem('name');
            removeItem('visit');
            location.reload();
        };

        /**
         *  Transform all the data in a link to share to others
         *  @param {string} if the param is not undefined, it means this function must only share
         *  images that were selected !
         */
        $scope.share = function(selected) {
            var link = '';

            // If not, share entire album
            if (selected === null || selected === undefined) {
                for (i = 0; i < $scope.images.length; i++) {
                    link += '!url!' + $scope.images[i].url;
                }
            } else {
                for (i = 0; i < $scope.selectedPhotosByIndex.length; i++) {
                    link += '!url!' + $scope.images[$scope.selectedPhotosByIndex[i]].url;
                }
            }

            //If it's only sharing the name of the album, with empty photos
            if (link === '') {
                link = 'YOU HAVE NO PHOTOS';
            } else {
                if (selected === null || selected === undefined) {
                    link = 'http://phostery.github.io/' + '#name==' +
                        encodeURIComponent($scope.name) + '&&' + 'images==' + link;
                    snackbar('Created link for this album!');
                } else {
                    link = 'http://phostery.github.io/' + '#name==Shared%20With%20Me' + '&&' + 'images==' + link;
                    snackbar('Created link for ' + $scope.selectedPhotosByIndex.length + ' photos!');
                }
            }

            $scope.shareLink = link;
        };

        /**
         *  Save an shared album's photos to the localStorage cache,
         *  not overwritting the current data
         *  @param {boolean} If false, save all the photos on the album,
         *  otherwhise, save only the selected ones
         */
        $scope.save = function(saveSelection) {
            var data = [];
            var cache = localStorage.getItem('images');
            var x = JSON.parse(cache);

            var lengthX;

            // If there's photos on the cache, do not overwrite them !
            if (cache !== null && !saveSelection) {
                lengthX = x.length;
                // Save first the cache on the array
                for (i = 0; i < lengthX; i++) {
                    delete x[i].$$hashKey;
                    data.push(x[i]);
                }

                // Look for if some photo's url on the shared album is not already included on the cache
                for (i = 0; i < $scope.images.length; i++) {
                    delete $scope.images[i].$$hashKey;
                    equal = false;

                    // Compare urls with the cache
                    for (j = 0; j < lengthX; j++) {
                        if ($scope.images[i].url == x[j].url) {
                            equal = true;
                        }
                    }

                    // If the url of the photo is not the same, it can be included on the array
                    if (!equal) {
                        data.push($scope.images[i]);
                    }
                }

                snackbar('This album has been added to yours');

            } else if (cache !== null && saveSelection) {
                lengthX = x.length;
                // Save first the cache on the array
                for (i = 0; i < lengthX; i++) {
                    delete x[i].$$hashKey;
                    data.push(x[i]);
                }

                // Push the selected photos to the array
                for (i = 0, l = $scope.selectedPhotosByIndex.length; i < l; i++) {
                    delete $scope.images[$scope.selectedPhotosByIndex[i]].$$hashKey;
                    equal = false;

                    // Compare urls with the cache
                    for (j = 0; j < lengthX; j++) {
                        if ($scope.images[$scope.selectedPhotosByIndex[i]].url == x[j].url) {
                            equal = true;
                        }
                    }

                    // If the url of the photo is not the same, it can be included on the array
                    if (!equal) {
                        data.push($scope.images[$scope.selectedPhotosByIndex[i]]);
                    }
                }

                snackbar('Photos added to your album');

            } else {
                // If there's not previous cache, the photos of shared album can be painless added
                if (saveSelection) {
                    // Save only the selected photos to the array
                    for (i = 0, l = $scope.selectedPhotosByIndex.length; i < l; i++) {
                        delete $scope.images[$scope.selectedPhotosByIndex[i]].$$hashKey;
                        data.push($scope.images[$scope.selectedPhotosByIndex[i]]);
                    }

                    snackbar($scope.selectedPhotosByIndex.length + 'Photos added to you\'re album');
                } else {
                    // Save all the photos to the array
                    for (j = 0; j < $scope.images.length; j++) {
                        delete $scope.images[j].$$hashKey;
                        data.push($scope.images[j]);
                    }

                    snackbar('This album has been added to yours');
                }
            }

            // Save the data on the cache and reload
            setItem('images', JSON.stringify(data, function(key, val) {
                if (key == '$$hashKey') {
                    return undefined;
                }
                return val;
            }));
            setItem('visit', true);

            if (!saveSelection) {
                window.location.assign('http://phostery.github.io/');
            }
        };

        /* ----- GALLERY SHOW IMAGE ----- */
        var imageShow = document.getElementsByClassName('image-show')[0];
        var indexImageShow, urlImageShow;
        /**
        *  Gets the link of the image, and shows the image in a image visualizer
        *  @param {string} The image to display on the visualizer
        *  @param {int} The index of the image displayed
        */
        $scope.showImage = function(item, index) {
           urlImageShow = item.url;
           indexImageShow = index;
           imageShow.style.background = 'url(' + item.url + ') center / contain no-repeat #000';
           imageShow.style.display = 'block';
           $location.path("/gallery/" + btoa(item.url)).replace();
        };

        /**
        *  Close the image in a image visualizer
        */
        $scope.closeImage = function() {
           imageShow.style.display = 'none';
           imageShow.style.background = 'black';
           $location.path("/").replace();
        };

        /**
         *  Delete the image on the image visualizer
         */
        $scope.deleteImage = function() {
            $scope.removeItem(indexImageShow);
            $scope.closeImage();
            snackbar('Image deleted!');
        };

        /**
         *  Open the url of the image in the visualizer
         */
        $scope.openImage = function() {
            window.open(urlImageShow);
        };

        /* ----- FUNCTIONS FOR DISPLAYING PROMPTS ----- */
        var input = document.getElementsByClassName('input');
        /**
         *  Fade the desire prompt
         *  @param {int} The index of the promp in the input array
         */
        $scope.showInput = function(i) {
            fadeIn(input[i]);
        };

        /**
         *  Fade the desire prompt
         *  @param {int} The index of the promp in the input array
         */
        $scope.hideInput = function(i) {
            fadeOut(input[i]);
            input[i].style.display = 'none';
        };

        /* ----- FUNCTIONS OF SELECTING IMAGES ----- */
        var actionCardBar = document.getElementsByClassName('mdl-card__actions');
        var selectButton = document.getElementsByClassName('select');

        /**
         *  Function for select one or more elements from the repeat
         *  @param {HTMLElement} The object which have been selected
         *  @param {int} The index of the selected image
         */
        $scope.select = function($event, index) {
            var target = $event.currentTarget;

            /*
             If the target is not enable, must enable it, get the index
             of the image selected and push it to the array
             */
            if (hasClass(target, 'not-selected')) {
                selectItems('select');
                swapClasses(target, 'not-selected', 'selected');
                target.getElementsByTagName('i')[0].innerHTML = 'check_circle';
                actionCardBar[index].style.background = '#5C6BC0';
                $scope.selectedPhotosByIndex.push(index);
            } else {
                selectItems('remove');
                swapClasses(target, 'selected', 'not-selected');
                target.getElementsByTagName('i')[0].innerHTML = 'check';
                actionCardBar[index].style.background = 'rgba(0, 0, 0, 0.2)';

                // Check for the select item on the array, and remove it
                for (i = 0, l = $scope.selectedPhotosByIndex.length; i < l; i++) {
                    if ($scope.selectedPhotosByIndex[i] == index) {
                        $scope.selectedPhotosByIndex.splice(i, 1);
                    }
                }
            }

        };

        /**
         *  Function for all the elements from the repeat
         */
        $scope.selectAll = function() {
            // If all the the images in the repeat weren't select yet, then select all
            if ($scope.selectedPhotosByIndex.length !== $scope.images.length) {
                // Clear the array, because it will now store all the index
                $scope.selectedPhotosByIndex = [];

                for (i = 0, l = selectButton.length; i < l; i++) {
                    if (hasClass(selectButton[i], 'not-selected')) {
                        selectItems('select');
                        swapClasses(selectButton[i], 'not-selected', 'selected');
                        selectButton[i].getElementsByTagName('i')[0].innerHTML = 'check_circle';
                        actionCardBar[i].style.background = '#5C6BC0';
                    }
                    // Push every index of the repeat to the array
                    $scope.selectedPhotosByIndex.push(i);
                }
            }
        };

        /**
         *  Remove all the selected images
         */
        $scope.deleteSelected = function() {
            // Sort the array in reverse, to not mess in delection
            $scope.selectedPhotosByIndex.sort().reverse();

            for (i = 0, l = $scope.selectedPhotosByIndex.length; i < l; i++) {
                $scope.removeItem($scope.selectedPhotosByIndex[i]);
                selectItems('remove');
            }

            snackbar($scope.selectedPhotosByIndex.length + ' Images removed');
            $scope.selectedPhotosByIndex = [];
        };

        /**
         *  Clear all the selected images, unselecting them
         */
        $scope.clearSelection = function() {
            var x = $scope.selectedPhotosByIndex;

            for (i = 0; i < x.length; i++) {
                if (hasClass(selectButton[x[i]], 'selected')) {
                    actionCardBar[x[i]].style.background = 'rgba(0, 0, 0, 0.2)';
                    swapClasses(selectButton[x[i]], 'selected', 'not-selected');
                    selectButton[x[i]].getElementsByTagName('i')[0].innerHTML = 'check';
                }

                selectItems('remove');
            }

            $scope.selectedPhotosByIndex = [];
        };

        /* ------------------------------------------------------------------- */

        /**
         *  Function for the dealing on opening links, checking if it's the regular
         *  url of if it's a shared url link
         *  @retun {Array<boolean>} return if the link openend constains an album name or images,
         *  wherein the first position is for the name and the second for the image
         */
        function run() {
            var code = [false, false];
            var name = getUrlData().name;
            var imgs = getUrlData().images;

            // If it's not the first time visiting, hide intro
            if (!localStorage.getItem('visit')) {
                setItem('visit', true);
                window.location.assign('about.html');
            }

            // if there's an album's name attr at the link opened
            if (name === undefined || name === null) {
                if (localStorage.getItem('name')) {
                    $scope.name = localStorage.getItem('name');
                }
            } else {
                // Change properties for a shared link page
                $scope.name = decodeURIComponent(name);
                document.getElementById('save-data').style.display = 'block';
                document.getElementById('clear-data').style.display = 'none';
                code[0] = true;
            }

            // if there are imgages attr at the link opened
            if (imgs === undefined || imgs === null) {
                if (localStorage.getItem('images')) {
                    $scope.images = JSON.parse(localStorage.getItem('images'));
                }
            } else {
                // Divide the link to get the data
                var splitUrl = imgs.split('!url!');

                for (i = 0, l = splitUrl.length; i < l; i++) {
                    if (i > 0) {
                        $scope.images.push({
                            url: splitUrl[i]
                        });
                    }
                }

                // Display button
                document.getElementById('save-selected').style.display = 'block';
                code[1] = true;
            }

            checkCache();
            return code;
        }
        // Run the localstorage and return the info
        code = run();
    }
]);

/**
 *  Add data to the localStorage cache
 *  @param {string} A keyname to get some data from the cache
 *  @param {Object} The data that will be stored
 */
function setItem(key, data) {
    localStorage.setItem(key, data);
}

/**
 *  Remove data from the localStorage cache
 *  @param {string} A keyname to get some data from the cache
 *  @param {Object} The data that will be returned
 */
function removeItem(key, data) {
    localStorage.removeItem(key, data);
}

/**
 *  Gets the link of a shared album and splits it as attributes, storing it in a array
 *  @return {Array.<string>} The atributes of the custom Url
 */
function getUrlData() {
    var vars = [],
        hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('#') + 1).split('&&');

    for (var i = 0, l = hashes.length; i < l; i++) {
        hash = hashes[i].split('==');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}

/**
 *  Checks if an element has an specific class
 *  @param {HTMLElement} The element to check if contains some class
 *  @param {string} The name of the class to look for in the element
 *  @return {boolean}
 */
function hasClass(el, cls) {
    return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
}

/**
 *  Swich one class for another in some element
 *  @param {HTMLElement} The element desired to swap classes
 *  @param {string} The name of the class that will be replaced
 *  @param {String} The name of the class that will replace the other class
 */
function swapClasses(elem, class1, class2) {
    if (hasClass(elem, class1)) {
        elem.classList.remove(class1);
    }

    elem.classList.add(class2);
}

/**
 *  A fadeIn animation effect
 *  @param {HTMLElement} The element desired
 */
function fadeIn(elem) {
    elem.style.display = 'block';
    elem.classList.remove('fadeOut');
    elem.classList.add('fadeIn');
}

/**
 *  A fadeOut animation effect
 *  @param {HTMLElement} The element desired
 */
function fadeOut(elem) {
    elem.classList.remove('fadeIn');
    elem.classList.add('fadeOut');
}

/**
 *  Show a message to the user, replacing the old javascript alert
 *  @param {string} The massage to display to the user
 */
var snackbarElem = document.getElementById('snackbar');

function snackbar(message) {
    if (message !== '' || message !== null) {
        snackbarElem.getElementsByTagName('span')[0].innerHTML = message;
        snackbarElem.style.display = 'block';
        swapClasses(snackbarElem, 'fadeOutDown', 'fadeInUp');

        setTimeout(function() {
            swapClasses(snackbarElem, 'fadeInUp', 'fadeOutDown');
        }, 3000);
    }
}

/**
 *  Shows the style of amount of icons selected
 *  @param {string} Define if one item was selected or not
 */
var options = document.getElementById('options');
var amount = document.getElementById('amount-selected');
var q = 0;

function selectItems(type) {
    options.style.display = 'block';
    options.classList.add('fadeInDown');

    if (type === 'select') {
        q++;
    } else {
        q--;
    }

    if (q <= 0) {
        q = 0;
        options.classList.remove('fadeInDown');
        options.style.display = 'none';
    }

    amount.innerHTML = q + ' selected';
}

/**
 *  Check the cache manifest, if there's a new version, download it and fetch
 */
var appCache = window.applicationCache;

function checkCache() {
    if (appCache.status !== 0) {
        appCache.update();

        if (appCache.status == window.applicationCache.UPDATEREADY) {
            appCache.swapCache();
            snackbar('Cache updated!');
        }
    }

}
