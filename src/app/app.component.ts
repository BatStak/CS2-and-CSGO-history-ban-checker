import { AfterViewInit, ApplicationRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';

import { Database, MatchFormat } from '../models';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HistoryLoaderComponent } from './components/history-loader/history-loader.component';
import { ScannerComponent } from './components/ban-scanner/ban-scanner.component';
import { BanStatisticsComponent } from './components/ban-statistics/ban-statistics.component';
import Bowser from 'bowser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HistoryLoaderComponent,
    ScannerComponent,
    BanStatisticsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  ready = false;

  get database(): Database {
    return this._dataService.database;
  }

  private _onDomUpdated = new Subject<void>();

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService,
    private _applicationRef: ApplicationRef
  ) {
    // for some reason, change detection does not work in firefox extension
    if (
      Bowser.getParser(window.navigator.userAgent).getBrowserName() ===
      'Firefox'
    ) {
      setInterval(() => this._applicationRef.tick(), 100);
    }
  }

  async ngAfterViewInit() {
    const section = new URLSearchParams(document.location.search).get('tab')!;
    let format = MatchFormat.MR12;
    if (section === 'matchhistorywingman') {
      format = MatchFormat.MR8;
    } else if (section === 'matchhistorycompetitive') {
      format = MatchFormat.MR15;
    }

    this._dataService.onReset.subscribe(() => {
      this._refreshUI();
    });

    const database = await chrome.storage.local.get();
    this._dataService.init(database, section, format);

    this._refreshUI();
    this._onDomUpdated.pipe(debounceTime(250)).subscribe(() => {
      this._refreshUI();
    });
    this._observeNewMatches();
    this.ready = true;
  }

  private _observeNewMatches() {
    const results = document.querySelector('.csgo_scoreboard_root > tbody');
    if (results) {
      const observer = new MutationObserver(() => {
        this._onDomUpdated.next();
      });
      observer.observe(results, { childList: true });
    }
  }

  private _refreshUI() {
    this._dataService.parseMatches();
    this._utilsService.getHistoryPeriod();
    this._dataService.onSave.next();
  }
}
