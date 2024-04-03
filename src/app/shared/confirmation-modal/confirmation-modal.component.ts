import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { hasValue } from '../empty.util';
import { OnInit } from '@angular/core';

@Component({
  selector: 'ds-confirmation-modal',
  templateUrl: 'confirmation-modal.component.html',
})
export class ConfirmationModalComponent implements OnInit {
  @Input() headerLabel: string;
  @Input() infoLabel: string;
  @Input() cancelLabel: string;
  @Input() confirmLabel: string;
  @Input() confirmIcon: string;
  /**
   * The brand color of the confirm button
   */
  @Input() brandColor = 'primary';

  @Input() dso: DSpaceObject;
  // To also use ConfirmationModalComponent when not for DSO
  @Input() name: string;

  /**
   * An event fired when the cancel or confirm button is clicked, with respectively false or true
   */
  @Output()
  response = new EventEmitter<boolean>();

  constructor(
    protected activeModal: NgbActiveModal,
    protected dsoNameService: DSONameService
  ) {
  }

  ngOnInit() {
    if (!hasValue(this.name) && hasValue(this.dso)) {
      this.name = this.dsoNameService.getName(this.dso);
    }
  }

  /**
   * Confirm the action that led to the modal
   */
  confirmPressed() {
    this.response.emit(true);
    this.close();
  }

  /**
   * Cancel the action that led to the modal and close modal
   */
  cancelPressed() {
    this.response.emit(false);
    this.close();
  }

  /**
   * Close the modal
   */
  close() {
    this.activeModal.close();
  }
}
