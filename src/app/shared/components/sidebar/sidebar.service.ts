import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this._isOpen.asObservable();

  toggle(): void {
    this._isOpen.next(!this._isOpen.value);
  }

  close(): void {
    this._isOpen.next(false);
  }
}