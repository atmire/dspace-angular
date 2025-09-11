import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import {
  RequestParam,
  SortDirection,
  SortOptions,
  FindListOptions,
  PaginatedList,
  ProcessDataService,
  RemoteData,
  PaginationComponentOptions,
  Process,
  ProcessStatus,
} from '@dspace/core'
import { hasValue } from '@dspace/utils';
import { Observable } from 'rxjs';

/**
 * The sortable fields for processes
 * See [the endpoint documentation]{@link https://github.com/DSpace/RestContract/blob/main/processes-endpoint.md#search-processes-by-property}
 * for details.
 */
export enum ProcessSortField {
  creationTime = 'creationTime',
  startTime = 'startTime',
  endTime = 'endTime',
}

/**
 * Service to manage the processes displayed in the
 * {@Link ProcessOverviewComponent} and the {@Link ProcessOverviewTableComponent}
 */
@Injectable({
  providedIn: 'root',
})
export class ProcessOverviewService {

  constructor(protected processDataService: ProcessDataService) {
  }

  /**
   * Date format to use for start and end time of processes
   */
  dateFormat = 'yyyy-MM-dd HH:mm:ss';

  datePipe = new DatePipe('en-US');


  timeCreated = (process: Process) => this.datePipe.transform(process.creationTime, this.dateFormat, 'UTC');
  timeCompleted = (process: Process) => this.datePipe.transform(process.endTime, this.dateFormat, 'UTC');
  timeStarted = (process: Process) => this.datePipe.transform(process.startTime, this.dateFormat, 'UTC');

  /**
   * Retrieve processes by their status
   * @param processStatus              The status for which to retrieve processes
   * @param findListOptions            The FindListOptions object
   * @param autoRefreshingIntervalInMs Optional: The interval by which to automatically refresh the retrieved processes.
   * Leave empty or set to null to only retrieve the processes once.
   */
  getProcessesByProcessStatus(processStatus: ProcessStatus, findListOptions?: FindListOptions, autoRefreshingIntervalInMs: number = null): Observable<RemoteData<PaginatedList<Process>>> {
    const requestParam = new RequestParam('processStatus', processStatus);
    const options: FindListOptions = Object.assign(new FindListOptions(), {
      searchParams: [requestParam],
      elementsPerPage: 5,
    }, findListOptions);

    if (hasValue(autoRefreshingIntervalInMs) && autoRefreshingIntervalInMs > 0) {
      this.processDataService.stopAutoRefreshing(processStatus);
      return this.processDataService.autoRefreshingSearchBy(processStatus, 'byProperty', options, autoRefreshingIntervalInMs);
    } else {
      return this.processDataService.searchBy('byProperty', options);
    }
  }

  /**
   * Stop auto-refreshing the process with the given status
   * @param processStatus the processStatus of the request to stop automatically refreshing
   */
  stopAutoRefreshing(processStatus: ProcessStatus) {
    this.processDataService.stopAutoRefreshing(processStatus);
  }

  /**
   * Map the provided paginationOptions to FindListOptions
   * @param paginationOptions the PaginationComponentOptions to map
   * @param sortField the field on which the processes are sorted
   */
  getFindListOptions(paginationOptions: PaginationComponentOptions, sortField: ProcessSortField): FindListOptions {
    const sortOptions = new SortOptions(sortField, SortDirection.DESC);
    return Object.assign(
      new FindListOptions(),
      {
        currentPage: paginationOptions.currentPage,
        elementsPerPage: paginationOptions.pageSize,
        sort: sortOptions,
      },
    );
  }

}
