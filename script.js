document.addEventListener('DOMContentLoaded', function() {
    // Calculate canvas size based on container
    const container = document.querySelector('.canvas-container');
    const size = Math.min(container.clientWidth, container.clientHeight);

    const canvas = new fabric.Canvas('canvas', {
        width: size,
        height: size,
        backgroundColor: 'transparent',
        selection: false,
        allowTouchScrolling: false // Disable page scrolling when touching canvas
    });

    // Add mobile instructions and edit button
    const controls = document.querySelector('.controls');
    const editBtn = document.createElement('button');
    editBtn.id = 'editBtn';
    editBtn.textContent = 'Chỉnh sửa ảnh';
    editBtn.style.display = 'none';
    controls.appendChild(editBtn);

    const instructions = document.createElement('div');
    instructions.className = 'mobile-instructions';
    instructions.style.display = 'none'; // Hide by default
    instructions.innerHTML = `
        <p>👆 Chạm và kéo để di chuyển ảnh</p>
        <p>🤏 Chụm/Tách 2 ngón tay để thu phóng ảnh</p>
        <p>✅ Nhấn "Xong" khi đã chỉnh sửa xong</p>
    `;
    container.parentNode.insertBefore(instructions, container);

    const imageInput = document.getElementById('imageInput');
    const downloadBtn = document.getElementById('downloadBtn');
    let userImage = null;
    let frame = null;
    let isEditMode = false;

    // Handle responsive canvas
    window.addEventListener('resize', () => {
        const newSize = Math.min(container.clientWidth, container.clientHeight);
        canvas.setDimensions({
            width: newSize,
            height: newSize
        });
        canvas.renderAll();
    });

    // Load frame
    fabric.Image.fromURL('./public/frame.webp', function(img) {
        frame = img;
        frame.scaleToWidth(canvas.width);
        frame.scaleToHeight(canvas.height);
        frame.selectable = false;
        canvas.add(frame);
        frame.center();
    });

    // Edit button click handler
    editBtn.addEventListener('click', function() {
        isEditMode = !isEditMode;
        if (isEditMode) {
            editBtn.textContent = 'Xong';
            editBtn.classList.add('editing');
            instructions.style.display = 'block';
            if (userImage) {
                userImage.selectable = true;
                userImage.hasControls = true;
                canvas.setActiveObject(userImage);
            }
        } else {
            editBtn.textContent = 'Chỉnh sửa ảnh';
            editBtn.classList.remove('editing');
            instructions.style.display = 'none';
            if (userImage) {
                userImage.selectable = false;
                userImage.hasControls = false;
                canvas.discardActiveObject();
            }
        }
        canvas.renderAll();
    });

    // Modify image upload handler
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (userImage) {
                    canvas.remove(userImage);
                }

                fabric.Image.fromURL(e.target.result, function(img) {
                    userImage = img;
                    
                    const frameSize = canvas.width * 0.85;
                    const scale = frameSize / Math.max(img.width, img.height);
                    
                    userImage.scale(scale);
                    userImage.set({
                        left: canvas.width / 2,
                        top: canvas.height / 2,
                        originX: 'center',
                        originY: 'center',
                        selectable: false, // Default not selectable
                        hasControls: false, // Default no controls
                        hasBorders: false,
                        lockUniScaling: true
                    });

                    canvas.insertAt(userImage, 0);
                    canvas.renderAll();
                    downloadBtn.style.display = 'inline-block';
                    editBtn.style.display = 'inline-block';
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Download functionality remains the same
    downloadBtn.addEventListener('click', function() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = 1500;
        tempCanvas.height = 1500;
        
        const tempFabricCanvas = new fabric.Canvas(tempCanvas, {
            width: 1500,
            height: 1500
        });

        canvas.getObjects().forEach(obj => {
            const clonedObj = fabric.util.object.clone(obj);
            const scaleFactor = 1500 / size;
            
            clonedObj.scaleX = obj.scaleX * scaleFactor;
            clonedObj.scaleY = obj.scaleY * scaleFactor;
            clonedObj.left = obj.left * scaleFactor;
            clonedObj.top = obj.top * scaleFactor;
            
            tempFabricCanvas.add(clonedObj);
        });

        tempFabricCanvas.renderAll();
        
        const link = document.createElement('a');
        link.download = 'image-with-frame.png';
        link.href = tempFabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1
        });
        link.click();

        tempFabricCanvas.dispose();
    });

    // Thêm code xử lý drag and drop vào đầu file
    const dropZone = document.body;
    const body = document.body;

    // Ngăn chặn hành vi mặc định của trình duyệt
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Thêm class khi drag vào
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Xử lý khi thả file
    dropZone.addEventListener('drop', handleDrop, false);

    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        body.classList.add('dragging');
    }

    function unhighlight(e) {
        body.classList.remove('dragging');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                // Sử dụng lại logic xử lý ảnh hiện có
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (userImage) {
                        canvas.remove(userImage);
                    }

                    fabric.Image.fromURL(e.target.result, function(img) {
                        userImage = img;
                        
                        const frameSize = canvas.width * 0.85;
                        const scale = frameSize / Math.max(img.width, img.height);
                        
                        userImage.scale(scale);
                        userImage.set({
                            left: canvas.width / 2,
                            top: canvas.height / 2,
                            originX: 'center',
                            originY: 'center',
                            selectable: false,
                            hasControls: false,
                            hasBorders: false,
                            lockUniScaling: true
                        });

                        canvas.insertAt(userImage, 0);
                        canvas.renderAll();
                        downloadBtn.style.display = 'inline-block';
                        editBtn.style.display = 'inline-block';
                    });
                };
                reader.readAsDataURL(file);
            } else {
                alert('Vui lòng chỉ kéo thả file ảnh');
            }
        }
    }
}); 