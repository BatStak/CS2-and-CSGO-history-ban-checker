import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'cs2-history-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
})
export class OptionsComponent {
  apiKey?: string;

  showOptions = false;

  get isLoadingHistory(): boolean {
    return this._utilsService.isLoadingHistory;
  }

  get isScanning(): boolean {
    return this._utilsService.isScanning;
  }

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService
  ) {
    this.apiKey = this._dataService.database.apiKey;
  }

  openOptions() {
    this.showOptions = true;
  }

  closeOptions() {
    this.showOptions = false;
    this._dataService.database.apiKey = this.apiKey;
    this._dataService.save();
  }

  resetDatabase() {
    this._dataService.reset();
  }
}
