import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiService } from '../services/api.service';
import { DataService } from '../services/data.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.css']
})
export class ProductAddComponent implements OnInit {

  productForm: FormGroup;
  nameValidationRegex: any;
  priceValidationRegex: any;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ]
  };
  showloader = false;
  imageError: string;
  isImageSaved = false;
  cardImageBase64: string = null;
  editorError: string;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private apiService: ApiService,
  ) {
    this.nameValidationRegex = this.dataService.nameValidationRegex;
    this.priceValidationRegex = this.dataService.priceValidationRegex;

    this.productForm = this.fb.group({
      // tslint:disable-next-line:max-line-length
      productname: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(2), Validators.pattern(this.nameValidationRegex)]),
      productdesc: new FormControl('', [Validators.required, Validators.minLength(2)]),
      productprice: new FormControl('', [Validators.required, Validators.pattern(this.priceValidationRegex)]),
      productvolume: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void { }

  fileChangeEvent(fileInput: any): boolean {
    this.imageError = null;
    if (fileInput.target.files && fileInput.target.files[0]) {
      // -- Size Filter Bytes
      const maxSize = 20971520;
      const allowedTypes = ['image/png', 'image/jpeg'];
      const maxHeight = 15200;
      const maxWidth = 25600;

      if (fileInput.target.files[0].size > maxSize) {
        this.imageError = 'Maximum size allowed is ' + maxSize / 1000 + 'Mb';
        return false;
      }

      if (!_.includes(allowedTypes, fileInput.target.files[0].type)) {
        this.imageError = 'Only images are allowed(JPG, PNG)';
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const image = new Image();
        image.src = e.target.result;
        image.onload = rs => {
          const height = 'height';
          const width = 'height';
          const imgHeight = rs.currentTarget[height];
          const imgWidth = rs.currentTarget[width];
          // console.log('imgHeight, imgWidth: ', imgHeight, imgWidth);

          if (imgHeight > maxHeight && imgWidth > maxWidth) {
            this.imageError = 'Maximum dimentions allowed ' + maxHeight + '*' + maxWidth + 'px';
            return false;
          } else {
            const imgBase64Path = e.target.result;
            this.cardImageBase64 = imgBase64Path;
            this.isImageSaved = true;
            // console.log('this.cardImageBase64: ', this.cardImageBase64);
          }
        };
      };

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  removeImage(element): void {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
    element.value = '';
  }

  editorChangeEvent(input: string): void {
    // console.log('editorChangeEvent input: ', input);
    this.editorError = '';
    if (input.length === 0) {
      this.editorError = 'Product description is required.';
    }
  }

  async submitProduct(): Promise<void> {
    if (this.productForm.valid && this.cardImageBase64 !== null) {
      const url = 'product/add';

      const payload = {
        name: this.productForm.value.productname,
        price: this.productForm.value.productprice,
        volume: this.productForm.value.productvolume,
        image: this.cardImageBase64,
        description: this.productForm.value.productdesc,
      };
      // console.log('submitProduct payload: ', payload);
      this.showloader = true;
      this.apiService.sendHttpCallWithToken(payload, url, 'post').subscribe((response) => {
        console.log('submitProduct response: ' , response);
        this.showloader = false;
        if (response.status === 200) {
          this.dataService.showSuccess(response.message);
        } else if (response.status === 400) {
          this.dataService.showError(response.message);
        } else {
          this.dataService.showError('Unable to add product');
        }
      }, (error) => {
        console.log('submitProduct error: ' , error);
        this.showloader = false;
        if (error.message) {
          this.dataService.showError(error.message);
        } else {
          this.dataService.showError('Unable to add product');
        }
      });
    } else {
      this.dataService.showError('Please fill require details'); // --- Display error message
      Object.keys(this.productForm.controls).forEach((field) => {
        const control = this.productForm.get(field);
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      });
    }
  }

  resetForm(element): void {
    this.productForm.patchValue({
      productname: '',
      productdesc: '',
      productprice: '',
      productvolume: '',
    });

    this.cardImageBase64 = null;
    this.isImageSaved = false;
    element.value = '';
  }

}
