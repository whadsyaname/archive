package com.gallery.service;

import com.gallery.config.StorageProperties;
import com.gallery.domain.Photo;
import com.gallery.repository.PhotoRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class PhotoStorageService {

    private final Path rootLocation;
    private final PhotoRepository photoRepository;

    public PhotoStorageService(StorageProperties storageProperties, PhotoRepository photoRepository) {
        this.rootLocation = storageProperties.getPathAsPath();
        this.photoRepository = photoRepository;
    }

    @Transactional
    public Photo store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일은 업로드할 수 없습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "unknown";
        }

        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i);
        }
        String storedFilename = UUID.randomUUID().toString() + extension;

        Path destinationFile = rootLocation.resolve(storedFilename).normalize().toAbsolutePath();
        if (!destinationFile.startsWith(rootLocation.toAbsolutePath())) {
            throw new IOException("저장 경로가 허용된 범위를 벗어났습니다.");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        }

        Photo photo = new Photo(
                originalFilename,
                storedFilename,
                file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                file.getSize()
        );
        return photoRepository.save(photo);
    }

    public List<Photo> findAll() {
        return photoRepository.findAllByOrderByUploadedAtDesc();
    }

    public Resource loadAsResource(String photoId) throws IOException {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("사진을 찾을 수 없습니다: " + photoId));

        Path file = rootLocation.resolve(photo.getStoredFilename()).normalize().toAbsolutePath();
        if (!Files.exists(file) || !file.startsWith(rootLocation.toAbsolutePath())) {
            throw new IOException("파일을 찾을 수 없습니다: " + photo.getStoredFilename());
        }

        Resource resource = new UrlResource(file.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new IOException("파일을 읽을 수 없습니다: " + photo.getStoredFilename());
        }
        return resource;
    }

    public Photo getPhoto(String photoId) {
        return photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("사진을 찾을 수 없습니다: " + photoId));
    }

    @Transactional
    public void delete(String photoId) throws IOException {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("사진을 찾을 수 없습니다: " + photoId));
        Path file = rootLocation.resolve(photo.getStoredFilename()).normalize().toAbsolutePath();
        if (Files.exists(file) && file.startsWith(rootLocation.toAbsolutePath())) {
            Files.delete(file);
        }
        photoRepository.delete(photo);
    }
}
