import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  currency = '$';
  nameValidationRegex = /^[0-9a-zA-Z\s-,.\']+$/;
  priceValidationRegex = /^\d{0,8}(\.\d{1,4})?$/;
  toastConfig: object = {
    timeOut: 3000,
    progressBar: true,
  };

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
  ) { }

  // --- For showing the loader with custom setup, you can change the setup here
  showLoader(): void {
    this.spinner.show();
  }

  // --- For hideing the loader
  hideLoader(): void {
    this.spinner.hide();
  }

  // --- For showing the success toast
  showSuccess(message: string | any, title: any = null): void {
    // console.log('toast called');
    this.toastr.success(message, 'Success!', this.toastConfig);
  }

  // --- For showing the error toast
  showError(message: string | any, title: any = null): void {
    // console.log('toast called');
    this.toastr.error(message, 'Error!', this.toastConfig);
  }

  // --- For showing the info toast
  showInfo(message: string | any, title: any = null): void {
    this.toastr.info(message, 'Info!', this.toastConfig);
  }

}
