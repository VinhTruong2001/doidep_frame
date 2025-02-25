document.addEventListener('DOMContentLoaded', function() {
    const canvas = new fabric.Canvas('canvas', {
        width: 500,
        height: 500,
        backgroundColor: 'transparent'
    });
    
    const imageInput = document.getElementById('imageInput');
    const downloadBtn = document.getElementById('downloadBtn');
    let userImage = null;
    let frame = null;

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
                // Xóa ảnh cũ nếu có
                if (userImage) {
                    canvas.remove(userImage);
                }

                // Tải ảnh mới
                fabric.Image.fromURL(e.target.result, function(img) {
                    userImage = img;
                    
                    // Tính toán tỷ lệ để ảnh vừa với frame
                    const frameSize = canvas.width * 0.85;
                    const scale = frameSize / Math.max(img.width, img.height);
                    
                    userImage.scale(scale);
                    userImage.set({
                        left: canvas.width / 2,
                        top: canvas.height / 2,
                        originX: 'center',
                        originY: 'center'
                    });

                    // Thêm ảnh vào canvas
                    canvas.insertAt(userImage, 0);
                    canvas.renderAll();
                    
                    // Hiện nút download
                    downloadBtn.style.display = 'inline-block';
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Xử lý tải ảnh về
    downloadBtn.addEventListener('click', function() {
        // Tạo canvas tạm thời với kích thước lớn hơn
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Đặt kích thước 1500x1500 cho ảnh tải về
        tempCanvas.width = 1500;
        tempCanvas.height = 1500;
        
        // Tạo một canvas tạm thời mới với Fabric
        const tempFabricCanvas = new fabric.Canvas(tempCanvas, {
            width: 1500,
            height: 1500
        });

        // Clone các đối tượng từ canvas gốc
        canvas.getObjects().forEach(obj => {
            const clonedObj = fabric.util.object.clone(obj);
            
            // Tính toán tỷ lệ scale mới (1500/500 = 3)
            const scaleFactor = 1500 / 500;
            
            // Áp dụng scale mới
            clonedObj.scaleX = obj.scaleX * scaleFactor;
            clonedObj.scaleY = obj.scaleY * scaleFactor;
            clonedObj.left = obj.left * scaleFactor;
            clonedObj.top = obj.top * scaleFactor;
            
            tempFabricCanvas.add(clonedObj);
        });

        tempFabricCanvas.renderAll();
        
        // Tạo link tải về với canvas độ phân giải cao
        const link = document.createElement('a');
        link.download = 'image-with-frame.png';
        link.href = tempFabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1
        });
        link.click();

        // Dọn dẹp
        tempFabricCanvas.dispose();
    });
}); 