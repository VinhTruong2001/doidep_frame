document.addEventListener('DOMContentLoaded', function() {
    // Tính toán kích thước canvas dựa trên container
    const container = document.querySelector('.canvas-container');
    const size = Math.min(container.clientWidth, container.clientHeight);

    const canvas = new fabric.Canvas('canvas', {
        width: size,
        height: size,
        backgroundColor: 'transparent',
        selection: false // Tắt selection để tránh bug trên mobile
    });

    const imageInput = document.getElementById('imageInput');
    const downloadBtn = document.getElementById('downloadBtn');
    let userImage = null;
    let frame = null;

    // Xử lý responsive
    window.addEventListener('resize', () => {
        const newSize = Math.min(container.clientWidth, container.clientHeight);
        canvas.setDimensions({
            width: newSize,
            height: newSize
        });
        canvas.renderAll();
    });

    // Tải frame
    fabric.Image.fromURL('./public/frame.png', function(img) {
        frame = img;
        frame.scaleToWidth(canvas.width);
        frame.scaleToHeight(canvas.height);
        frame.selectable = false;
        canvas.add(frame);
        frame.center();
    });

    // Xử lý khi user chọn ảnh
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
                        originY: 'center'
                    });

                    canvas.insertAt(userImage, 0);
                    canvas.renderAll();
                    downloadBtn.style.display = 'inline-block';
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Tối ưu cho mobile touch
    canvas.on('touch:gesture', function(opt) {
        var e = opt.e;
        if (userImage) {
            if (e.scale) {
                userImage.scale(userImage.scaleX * e.scale);
                canvas.renderAll();
            }
        }
    });

    // Prevent page scrolling when interacting with canvas on mobile
    canvas.on('mouse:down', function() {
        container.classList.add('dragging');
    });

    canvas.on('mouse:up', function() {
        container.classList.remove('dragging');
    });

    // Download vẫn giữ nguyên như cũ
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
}); 