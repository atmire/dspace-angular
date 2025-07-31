import { AsyncPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  NgxGalleryAnimation,
  NgxGalleryComponent,
  NgxGalleryImage,
  NgxGalleryModule,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { Observable } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';
import { hasValue } from '../../../shared/empty.util';

/**
 * This component render an image gallery for the image viewer
 */
@Component({
  selector: 'ds-base-media-viewer-image',
  templateUrl: './media-viewer-image.component.html',
  styleUrls: ['./media-viewer-image.component.scss'],
  imports: [
    AsyncPipe,
    NgxGalleryModule,
  ],
  standalone: true,
})
export class MediaViewerImageComponent implements OnChanges, OnInit, AfterViewInit {
  @Input() images: MediaViewerItem[];
  @Input() preview?: boolean;
  @Input() image?: string;
  @Input() pageIndex?: number;
  @Output() pageChange? = new EventEmitter<number>();
  @ViewChild(NgxGalleryComponent) gallery: NgxGalleryComponent;

  thumbnailPlaceholder = './assets/images/replacement_image.svg';

  galleryOptions: NgxGalleryOptions[] = [];

  galleryImages: NgxGalleryImage[] = [];

  /**
   * Whether or not the current user is authenticated
   */
  isAuthenticated$: Observable<boolean>;

  constructor(
    protected authService: AuthService,
  ) {
  }

  ngOnChanges(): void {
    this.galleryOptions = [
      {
        preview: this.preview !== undefined ? this.preview : true,
        image: true,
        imageSize: 'contain',
        thumbnails: false,
        imageArrows: false,
        startIndex: 0,
        imageAnimation: NgxGalleryAnimation.Slide,
        previewCloseOnEsc: true,
        previewZoom: true,
        previewRotate: true,
        previewFullscreen: true,
      },
    ];
    if (this.image) {
      this.galleryImages = [
        {
          small: this.image,
          medium: this.image,
          big: this.image,
        },
      ];
    } else {
      this.galleryImages = this.convertToGalleryImage(this.images);
    }
  }

  /**
   * The gallery component does not natively support lazy loading
   * This causes it to close in the event of updating the content dynamically
   * As a workaround, re-open it at the correct index
   */
  ngAfterViewInit() {
    if (!this.gallery?.previewEnabled && this.pageIndex && this.pageIndex !== 0) {
      this.gallery.openPreview(this.pageIndex);
    }
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated();
    this.ngOnChanges();
  }

  /**
   * This method convert an array of MediaViewerItem into NgxGalleryImage array
   * @param medias input NgxGalleryImage array
   */
  convertToGalleryImage(medias: MediaViewerItem[]): NgxGalleryImage[] {
    const mappedImages = [];
    for (const image of medias) {
      if (image.format === 'image') {
        mappedImages.push({
          small: image.thumbnail
            ? image.thumbnail
            : this.thumbnailPlaceholder,
          medium: image.thumbnail
            ? image.thumbnail
            : this.thumbnailPlaceholder,
          big: image.bitstream._links.content.href + (hasValue(image.accessToken) ? ('?accessToken=' + image.accessToken) : ''),
        });
      }
    }
    return mappedImages;
  }

  handlePreviewChange({ index }: { index: number, image: NgxGalleryImage }) {
    if (index >= this.galleryImages.length - 1) {
      this.pageChange.emit(index + 1);
    }
  }
}
