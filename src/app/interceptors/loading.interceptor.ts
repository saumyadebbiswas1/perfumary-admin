import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
// import 'rxjs/add/operator/catch';
// import 'rxjs/operators';
import { throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { DataService } from '../services/data.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private dataService: DataService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // let loadingRef: LoadingOverlayRef;
    Promise.resolve(null).then(() => this.dataService.showLoader());
    return next.handle(req).pipe( tap(event => {
      if (event instanceof HttpResponse) {
        // loadingRef.close();
        if (event.body === null) {
          this.dataService.showError('No Data Found');
          this.dataService.hideLoader();
        }
        this.dataService.hideLoader();
      }
    })).pipe( catchError( error => {
      if (error) {
        this.dataService.hideLoader();
      }
      return throwError;
    }));
  }
}
