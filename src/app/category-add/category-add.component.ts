import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ApiService } from '../services/api.service';
import { DataService } from '../services/data.service';
import * as _ from 'lodash';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.css']
})
export class CategoryAddComponent implements OnInit {

  categoryForm: FormGroup;
  nameValidationRegex: any;
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
  productList = [];
  selectedItems = [];
  dropdownSettings: IDropdownSettings;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private apiService: ApiService,
  ) {
    this.nameValidationRegex = this.dataService.nameValidationRegex;
    this.categoryForm = this.fb.group({
      // tslint:disable-next-line:max-line-length
      categoryname: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(2), Validators.pattern(this.nameValidationRegex)]),
      categorydesc: new FormControl('', [Validators.required, Validators.minLength(2)]),
      products: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      // itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.getProductFromApi();
  }

  onItemSelect(item: any): void  {
    // console.log('onItemSelect: ', item);
    this.selectedItems.push(item);
    // console.log('onItemSelect this.selectedItems: ', this.selectedItems);
  }

  onItemDeSelect(item: any): void  {
    // console.log('onItemDeSelect: ', item);
    this.selectedItems = this.selectedItems.filter(data => data.id !== item.id);
    // console.log('onItemDeSelect this.selectedItems: ', this.selectedItems);
  }

  onSelectAll(items: any): void  {
    // console.log('onSelectAll: ', items);
    this.selectedItems = items;
    // console.log('onSelectAll this.selectedItems: ', this.selectedItems);
  }

  onDeSelectAll(items: any): void  {
    // console.log('onDeSelectAll: ', items);
    this.selectedItems = [];
    // console.log('onDeSelectAll this.selectedItems: ', this.selectedItems);
  }

  async getProductFromApi(): Promise<void> {
    const url = 'product';
    this.showloader = true;
    this.apiService.sendHttpCallWithToken('', url, 'get').subscribe((response) => {
      // console.log('getProductFromApi response: ' , response);
      this.showloader = false;
      this.productList = [];
      if (response.product && response.product.length > 0) {
        response.product.forEach(element => {
          this.productList.push({
            id: element.id,
            name: element.data.name
          });
        });
      } else {
        this.dataService.showError('No product found!');
      }
      // console.log('this.productList: ', this.productList);
    }, (error) => {
      console.log('getProductFromApi error: ' , error);
      this.showloader = false;
      this.dataService.showError('Unable to load product list!');
    });
  }

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
      this.editorError = 'Category description is required.';
    }
  }

  async submitCategory(): Promise<void> {
    if (this.categoryForm.valid && this.cardImageBase64 !== null) {
      if (this.selectedItems.length > 0) {
        const products = [];
        this.selectedItems.forEach(element => {
          products.push(element.id);
        });
        const url = 'category/add';
        const payload = {
          name: this.categoryForm.value.categoryname,
          image: this.cardImageBase64,
          description: this.categoryForm.value.categorydesc,
          products
        };
        // console.log('submitCategory payload: ', payload);
        this.showloader = true;
        this.apiService.sendHttpCallWithToken(payload, url, 'post').subscribe((response) => {
          console.log('submitCategory response: ' , response);
          this.showloader = false;
          if (response.status === 200) {
            this.dataService.showSuccess(response.message);
          } else if (response.status === 400) {
            this.dataService.showError(response.message);
          } else {
            this.dataService.showError('Unable to add category');
          }
        }, (error) => {
          console.log('submitCategory error: ' , error);
          this.showloader = false;
          if (error.message) {
            this.dataService.showError(error.message);
          } else {
            this.dataService.showError('Unable to add category');
          }
        });
      } else {
        this.dataService.showError('Please select a product'); // --- Display error message
      }
    } else {
      this.dataService.showError('Please fill require details'); // --- Display error message
      Object.keys(this.categoryForm.controls).forEach((field) => {
        const control = this.categoryForm.get(field);
        control.markAsTouched({ onlySelf: true });
        control.markAsDirty({ onlySelf: true });
      });
    }
  }

  resetForm(element): void {
    this.categoryForm.patchValue({
      categoryname: '',
      categorydesc: '',
      products: null
    });

    this.selectedItems = [];
    this.cardImageBase64 = null;
    this.isImageSaved = false;
    element.value = '';
  }

}
