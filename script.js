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
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        
        const link = document.createElement('a');
        link.download = 'image-with-frame.png';
        link.href = dataURL;
        link.click();
    });
}); 