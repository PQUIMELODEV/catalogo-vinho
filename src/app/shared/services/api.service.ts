import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  protected readonly API = 'https://localhost:44396/api';
  constructor(protected http: HttpClient) {}
}
