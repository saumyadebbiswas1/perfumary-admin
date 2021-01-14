import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiService } from '../services/api.service';
import { DataService } from '../services/data.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css']
})
export class ProductEditComponent implements OnInit {

  productData: any;
  productId: string = null;
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
  isImageChanged = false;
  cardImageBase64: string = null;
  editorError: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
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

  ngOnInit(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('productId');
    // console.log('ngOnInit this.productId: ', this.productId);
    if (this.productId.length === 0) {
      this.dataService.showError('Product details not found.'); // --- Display error message
      this.router.navigate(['/product-list']);
    } else {
      this.getProduct();
    }
  }

  async getProduct(): Promise<void> {
    const url = 'product/' + this.productId;
    this.showloader = true;
    this.apiService.sendHttpCallWithToken('', url, 'get').subscribe((response) => {
      // console.log('getProduct response: ' , response);
      this.showloader = false;
      if (response.product) {
        this.productData = response.product;
        this.populateProductData();
      } else {
        if (response.message) {
          this.dataService.showError(response.message);
        } else {
          this.dataService.showError('No product found!');
        }
        // this.router.navigate(['/product-list']);
      }
      // console.log('this.productData: ', this.productData);
    }, (error) => {
      console.log('getProduct error: ' , error);
      this.showloader = false;
      if (error.message) {
        this.dataService.showError(error.message);
      } else {
        this.dataService.showError('Unable to load product list!');
      }
      this.router.navigate(['/product-list']);
    });
  }

  populateProductData(): void {
    if (this.productData.data.image !== null || this.productData.data.image !== '') {
      this.cardImageBase64 = this.productData.data.image;
      this.isImageSaved = true;
    }
    this.productForm.patchValue({
      productname: this.productData.data.name,
      productprice: this.productData.data.price,
      productvolume: this.productData.data.volume,
      productdesc: this.productData.data.description,
    });
  }

  fileChangeEvent(fileInput: any): boolean {
    this.imageError = null;
    this.cardImageBase64 = this.productData.data.image;
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
            this.isImageChanged = true;
            // console.log('this.cardImageBase64: ', this.cardImageBase64);
          }
        };
      };

      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  removeImage(element): void {
    if (this.productData.data.image !== null || this.productData.data.image !== '') {
      this.cardImageBase64 = this.productData.data.image;
      this.isImageSaved = true;
      this.isImageChanged = false;
      element.value = '';
    } else {
      this.cardImageBase64 = null;
      this.isImageSaved = false;
      this.isImageChanged = false;
      element.value = '';
    }
  }

  editorChangeEvent(input: string): void {
    // console.log('editorChangeEvent input: ', input);
    this.editorError = '';
    if (input.length === 0) {
      this.editorError = 'Product description is required.';
    }
  }

  async submitProduct(element): Promise<void> {
    if (this.productForm.valid && this.cardImageBase64 !== null) {
      const url = 'product/edit/' + this.productId;
      const payload = {
        name: this.productForm.value.productname,
        price: this.productForm.value.productprice,
        volume: this.productForm.value.productvolume,
        image: this.cardImageBase64,
        description: this.productForm.value.productdesc,
      };
      if (this.cardImageBase64 === null) {
        delete payload.image;
      }
      this.showloader = true;
      // console.log('submitProduct payload: ', payload);
      this.apiService.sendHttpCallWithToken(payload, url, 'patch').subscribe((response) => {
        // console.log('submitProduct response: ' , response);
        this.showloader = false;
        if (response.status === 200) {
          this.dataService.showSuccess(response.message);
          this.productData.data.image = this.cardImageBase64;
          this.productData.data.name = this.productForm.value.productname;
          this.productData.data.description = this.productForm.value.productdesc;
          this.productData.data.price = this.productForm.value.productprice;
          this.productData.data.volume = this.productForm.value.productvolume;
          this.isImageChanged = false;
          element.value = '';
        } else if (response.status === 400) {
          this.dataService.showError(response.message);
        } else {
          this.dataService.showError('Unable to edit product');
        }
      }, (error) => {
        console.log('submitProduct error: ' , error);
        this.showloader = false;
        if (error.message) {
          this.dataService.showError(error.message);
        } else {
          this.dataService.showError('Unable to edit product');
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
      productname: this.productData.data.name,
      productprice: this.productData.data.price,
      productvolume: this.productData.data.volume,
      productdesc: this.productData.data.description,
    });

    if (this.isImageChanged) {
      this.cardImageBase64 = this.productData.data.image;
      this.isImageChanged = false;
      element.value = '';
    }
  }

}
