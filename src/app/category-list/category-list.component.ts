import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { DataService } from '../services/data.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  public categoryList: any = [];
  dtOptions: DataTables.Settings = {};
  showloader = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      processing: true
    };

    this.getCategoryFromApi();
  }

  async getCategoryFromApi(): Promise<void> {
    const url = 'catagories';
    this.showloader = true;
    this.apiService.sendHttpCallWithToken('', url, 'get').subscribe((response) => {
      // console.log('getCategoryFromApi response: ' , response);
      this.showloader = false;
      if (response.category && response.category.length > 0) {
        this.categoryList = response.category;
      } else {
        this.categoryList = [];
        this.dataService.showError('No category found!');
      }
      // console.log('this.categoryList: ', this.categoryList);
    }, (error) => {
      console.log('getCategoryFromApi error: ' , error);
      this.showloader = false;
      this.dataService.showError('Unable to load category list!');
    });
  }

  editCategory(categoryDetails): void {
    this.router.navigate(['/category-edit/' + categoryDetails.id]);
  }

  confirmDelete(categoryId, index): void {
    Swal.fire({
      title: 'Are you sure want to remove?',
      text: 'You will not be able to recover this record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.value) {
        this.deleteCategory(categoryId, index);
      } else if (result.dismiss === Swal.DismissReason.cancel) { }
    });
  }

  async deleteCategory(categoryId, index): Promise<void> {
    if (categoryId !== null) {
      const url = 'category/delete/' + categoryId;
      this.showloader = true;
      this.apiService.sendHttpCallWithToken('', url, 'delete').subscribe((response) => {
        // console.log('deleteCategory response: ' , response);
        this.showloader = false;
        if (response.status === 200) {
          this.categoryList.splice(index, 1); // -- Remove the item from categoryList array
          // this.dataService.showSuccess(response.message);
          Swal.fire(
            'Deleted!',
            'Category has been deleted',
            'success'
          );
        } else if (response.status === 400) {
          this.dataService.showError(response.message);
        } else {
          this.dataService.showError('Unable to delete category');
        }
      }, (error) => {
        this.showloader = false;
        console.log('deleteCategory error: ' , error);
        if (error.message) {
          this.dataService.showError(error.message);
        } else {
          this.dataService.showError('Unable to delete category');
        }
      });
    } else {
      this.dataService.showError('Details not found!');
    }
  }

}
