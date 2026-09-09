/**
 * Green Route Bus Stop Collector — main.js
 * Shared + page-specific JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
    // ---------- Dashboard: GPS capture ----------
    const captureBtn = document.getElementById('captureLocationBtn');
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    const gpsError = document.getElementById('error-gps');

    if (captureBtn && latInput && lngInput) {
        captureBtn.addEventListener('click', function () {
            if (!navigator.geolocation) {
                if (gpsError) gpsError.textContent = 'Geolocation is not supported by your browser.';
                return;
            }

            captureBtn.disabled = true;
            captureBtn.textContent = 'Getting location...';
            if (gpsError) gpsError.textContent = '';

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const lat = position.coords.latitude.toFixed(8);
                    const lng = position.coords.longitude.toFixed(8);
                    latInput.value = lat;
                    lngInput.value = lng;
                    captureBtn.textContent = 'Location Captured ✓';
                    captureBtn.classList.add('captured');
                    captureBtn.disabled = true;
                    latInput.classList.remove('error');
                    lngInput.classList.remove('error');
                    if (gpsError) gpsError.textContent = '';
                },
                function (err) {
                    captureBtn.disabled = false;
                    captureBtn.textContent = '📍 Capture My Location';
                    let msg = 'Unable to get location.';
                    if (err.code === 1) msg = 'Location permission denied. Please allow location access.';
                    else if (err.code === 2) msg = 'Location unavailable. Try again outdoors.';
                    else if (err.code === 3) msg = 'Location request timed out. Try again.';
                    if (gpsError) gpsError.textContent = msg;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        });
    }

    // ---------- Dashboard: Photo (Upload or Live Capture) ----------
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImg');
    const photoOptions = document.getElementById('photoOptions');
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const liveCaptureBtn = document.getElementById('liveCaptureBtn');
    const cameraPanel = document.getElementById('cameraPanel');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const switchCameraBtn = document.getElementById('switchCameraBtn');
    const cancelCameraBtn = document.getElementById('cancelCameraBtn');
    const retakePhotoBtn = document.getElementById('retakePhotoBtn');
    const photoError = document.getElementById('error-photo');

    let cameraStream = null;
    let facingMode = 'environment'; // back camera by default

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(function (track) {
                track.stop();
            });
            cameraStream = null;
        }
        if (cameraVideo) {
            cameraVideo.srcObject = null;
        }
        if (cameraPanel) {
            cameraPanel.classList.add('hidden');
        }
    }

    function showPreviewFromFile(file) {
        if (!file || !previewImg || !photoPreview) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            photoPreview.classList.remove('hidden');
            if (photoOptions) photoOptions.classList.add('hidden');
            if (photoError) photoError.textContent = '';
        };
        reader.readAsDataURL(file);
    }

    function setFileOnInput(file) {
        // Put the File into the hidden <input type="file"> so normal form submit works
        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
    }

    function resetPhotoUI() {
        stopCamera();
        if (photoInput) photoInput.value = '';
        if (previewImg) previewImg.src = '';
        if (photoPreview) photoPreview.classList.add('hidden');
        if (photoOptions) photoOptions.classList.remove('hidden');
        if (photoError) photoError.textContent = '';
    }

    // Upload from gallery
    if (uploadPhotoBtn && photoInput) {
        uploadPhotoBtn.addEventListener('click', function () {
            photoInput.click();
        });
    }

    if (photoInput && photoPreview && previewImg) {
        photoInput.addEventListener('change', function () {
            const file = this.files && this.files[0];
            if (file) {
                showPreviewFromFile(file);
            }
        });
    }

    // Start live camera
    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            if (photoError) {
                photoError.textContent = 'Camera is not supported on this device/browser.';
            }
            return;
        }

        stopCamera();

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            cameraVideo.srcObject = cameraStream;
            cameraPanel.classList.remove('hidden');
            if (photoOptions) photoOptions.classList.add('hidden');
            if (photoPreview) photoPreview.classList.add('hidden');
            if (photoError) photoError.textContent = '';
        } catch (err) {
            console.error(err);
            let msg = 'Could not open camera.';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                msg = 'Camera permission denied. Please allow camera access and try again.';
            } else if (err.name === 'NotFoundError') {
                msg = 'No camera found on this device.';
            }
            if (photoError) photoError.textContent = msg;
            if (photoOptions) photoOptions.classList.remove('hidden');
        }
    }

    if (liveCaptureBtn) {
        liveCaptureBtn.addEventListener('click', function () {
            startCamera();
        });
    }

    // Take photo from live feed
    if (takePhotoBtn && cameraVideo && cameraCanvas) {
        takePhotoBtn.addEventListener('click', function () {
            if (!cameraStream) return;

            const width = cameraVideo.videoWidth;
            const height = cameraVideo.videoHeight;
            if (!width || !height) return;

            cameraCanvas.width = width;
            cameraCanvas.height = height;
            const ctx = cameraCanvas.getContext('2d');
            ctx.drawImage(cameraVideo, 0, 0, width, height);

            cameraCanvas.toBlob(function (blob) {
                if (!blob) return;

                const file = new File([blob], 'bus-stop-photo.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });

                setFileOnInput(file);
                showPreviewFromFile(file);
                stopCamera();
            }, 'image/jpeg', 0.92);
        });
    }

    // Switch front / back camera
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', function () {
            facingMode = facingMode === 'environment' ? 'user' : 'environment';
            startCamera();
        });
    }

    // Cancel live camera
    if (cancelCameraBtn) {
        cancelCameraBtn.addEventListener('click', function () {
            stopCamera();
            if (photoOptions) photoOptions.classList.remove('hidden');
        });
    }

    // Retake / change photo
    if (retakePhotoBtn) {
        retakePhotoBtn.addEventListener('click', function () {
            resetPhotoUI();
        });
    }

    // Stop camera if user leaves the page
    window.addEventListener('beforeunload', stopCamera);

    // ---------- Dashboard: Form validation & submit ----------
    const stopForm = document.getElementById('stopForm');
    const submitBtn = document.getElementById('submitBtn');

    if (stopForm && submitBtn) {
        stopForm.addEventListener('submit', function (e) {
            let valid = true;

            function showError(id, message) {
                const el = document.getElementById(id);
                if (el) el.textContent = message;
            }

            function clearError(id) {
                const el = document.getElementById(id);
                if (el) el.textContent = '';
            }

            function markError(input, hasError) {
                if (input) {
                    if (hasError) input.classList.add('error');
                    else input.classList.remove('error');
                }
            }

            // Clear previous errors
            ['submitted_by', 'stop_name', 'area', 'city', 'gps', 'photo'].forEach(function (f) {
                clearError('error-' + f);
            });

            const submittedBy = document.getElementById('submitted_by');
            const stopName = document.getElementById('stop_name');
            const area = document.getElementById('area');
            const city = document.getElementById('city');
            const photo = document.getElementById('photo');

            if (!submittedBy || !submittedBy.value.trim()) {
                showError('error-submitted_by', 'Name is required');
                markError(submittedBy, true);
                valid = false;
            } else {
                markError(submittedBy, false);
            }

            if (!stopName || !stopName.value.trim()) {
                showError('error-stop_name', 'Bus stop name is required');
                markError(stopName, true);
                valid = false;
            } else {
                markError(stopName, false);
            }

            if (!area || !area.value.trim()) {
                showError('error-area', 'Area is required');
                markError(area, true);
                valid = false;
            } else {
                markError(area, false);
            }

            if (!city || !city.value) {
                showError('error-city', 'Please select a city');
                markError(city, true);
                valid = false;
            } else {
                markError(city, false);
            }

            if (!latInput || !latInput.value || !lngInput || !lngInput.value) {
                showError('error-gps', 'Please capture your GPS location');
                valid = false;
            }

            if (!photo || !photo.files || !photo.files.length) {
                showError('error-photo', 'Please upload or capture a photo');
                valid = false;
            }

            if (!valid) {
                e.preventDefault();
                return;
            }

            // Show loading state
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');
            if (btnText) btnText.classList.add('hidden');
            if (btnSpinner) btnSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
        });
    }

    // ---------- Toast (flash messages) ----------
    const flashToast = document.getElementById('flashToast');
    if (flashToast) {
        // Force reflow then show
        requestAnimationFrame(function () {
            flashToast.classList.add('show');
        });
        setTimeout(function () {
            flashToast.classList.remove('show');
            setTimeout(function () {
                flashToast.remove();
            }, 300);
        }, 3000);
    }

    // ---------- View Stops: Search filter ----------
    const searchInput = document.getElementById('searchInput');
    const stopsList = document.getElementById('stopsList');
    const searchEmpty = document.getElementById('searchEmpty');
    const loadMoreWrap = document.getElementById('loadMoreWrap');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    const PAGE_SIZE = 20;
    let visibleCount = PAGE_SIZE;

    function getAllCards() {
        return stopsList ? Array.from(stopsList.querySelectorAll('.stop-card')) : [];
    }

    function applyVisibility() {
        const cards = getAllCards();
        const query = (searchInput ? searchInput.value.trim().toLowerCase() : '');
        let matchCount = 0;
        let shown = 0;

        cards.forEach(function (card) {
            const name = card.dataset.name || '';
            const area = card.dataset.area || '';
            const city = card.dataset.city || '';
            const matches = !query || name.includes(query) || area.includes(query) || city.includes(query);

            if (matches) {
                matchCount++;
                if (shown < visibleCount) {
                    card.classList.remove('hidden');
                    shown++;
                } else {
                    card.classList.add('hidden');
                }
            } else {
                card.classList.add('hidden');
            }
        });

        if (searchEmpty) {
            if (matchCount === 0 && cards.length > 0) {
                searchEmpty.classList.remove('hidden');
            } else {
                searchEmpty.classList.add('hidden');
            }
        }

        if (loadMoreWrap) {
            if (matchCount > visibleCount) {
                loadMoreWrap.classList.remove('hidden');
            } else {
                loadMoreWrap.classList.add('hidden');
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            visibleCount = PAGE_SIZE;
            applyVisibility();
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            visibleCount += PAGE_SIZE;
            applyVisibility();
        });
    }

    // Initial visibility (for load-more)
    if (stopsList && getAllCards().length > PAGE_SIZE) {
        applyVisibility();
    }

    // ---------- Lightbox ----------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.remove('hidden');
        // Force reflow for transition
        requestAnimationFrame(function () {
            lightbox.classList.add('show');
        });
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('show');
        setTimeout(function () {
            lightbox.classList.add('hidden');
            if (lightboxImg) lightboxImg.src = '';
            document.body.style.overflow = '';
        }, 250);
    }

    if (stopsList) {
        stopsList.addEventListener('click', function (e) {
            const photo = e.target.closest('.stop-photo');
            if (photo) {
                const src = photo.dataset.src || (photo.querySelector('img') && photo.querySelector('img').src);
                if (src) openLightbox(src);
            }
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });
});
