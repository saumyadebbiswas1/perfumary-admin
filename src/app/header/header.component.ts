import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { NavigationStart, Router } from '@angular/router';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showMainMenu = true;
  resSidebar = true;
  currentTime = moment().format('h:mm:s A');
  currentDate = moment().format('ddd, D MMM YY');
  timer: any;
  currentPage;

  constructor(
    private globalService: GlobalService,
    private router: Router,
  ) {
    this.currentPage = this.router.url;
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        const searchType = 'url';
        this.currentPage = event[searchType];
      }
    });
  }

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.currentTime = moment().format('h:mm:ss A');
      this.currentDate = moment().format('ddd, D MMM YY');
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  showHideMenu(): void {
    if (this.showMainMenu) {
      this.showMainMenu = false;
      this.resSidebar = false;
    } else {
      this.showMainMenu = true;
      this.resSidebar = true;
    }
    this.globalService.publishSomeData({
      showMainMenu: this.showMainMenu,
    });
    // console.log('showHideMenu: ', this.showMainMenu);
  }

  navigateTo(path: any): void {
    this.router.navigate([path]);
  }

  signOut(): void {
    // localStorage.removeItem('loginData');
    // this.router.navigate(['login']);
  }

}
