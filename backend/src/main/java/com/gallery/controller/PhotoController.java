package com.gallery.controller;

import com.gallery.domain.Photo;
import com.gallery.service.PhotoStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoStorageService photoStorageService;

    public PhotoController(PhotoStorageService photoStorageService) {
        this.photoStorageService = photoStorageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Photo> upload(@RequestParam("file") MultipartFile file) throws IOException {
        Photo photo = photoStorageService.store(file);
        return ResponseEntity.ok(photo);
    }

    @GetMapping
    public ResponseEntity<List<Photo>> list() {
        return ResponseEntity.ok(photoStorageService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Photo> get(@PathVariable String id) {
        Photo photo = photoStorageService.getPhoto(id);
        return ResponseEntity.ok(photo);
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> serveFile(@PathVariable String id) throws IOException {
        Resource resource = photoStorageService.loadAsResource(id);
        Photo photo = photoStorageService.getPhoto(id);
        String contentType = photo.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + photo.getOriginalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) throws IOException {
        photoStorageService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
