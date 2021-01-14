import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  showMainMenu = true;
  widgetlist = false;
  totalCategory = 0;
  totalProducts = 0;
  totalSubscriber = 0;
  colorMode = 'dark';

  constructor(
    private globalService: GlobalService,
  ) {
    this.globalService.getObservable().subscribe((data) => {
      // console.log('globalService Data received: ', data);
      if (data.showMainMenu === true || data.showMainMenu === false) {
        this.showMainMenu = data.showMainMenu;
        // console.log('this.showMainMenu: ', this.showMainMenu);
      }
    });
  }

  ngOnInit(): void { }

  menuClassDeatails(): string {
    if (this.showMainMenu === false) {
      return 'd-none2';
    } else {
      return '';
    }
  }

  colorDetails(): any {
    if (this.colorMode === 'dark') {
      return 'dark-theme';
    } else if (this.colorMode === 'light') {
      return 'light-theme';
    }
  }
}
