// <div class="input-group">
//   <input name="fromDate" type="date" ng-attr-min-date="isEditMode && eventInfo.dates[0] || today"
//     uib-datepicker-popup ng-model="eventInfo.date" is-open="datepicker.fromDatePicker" ng-required="true" ng-readonly="true"
//     ng-disabled="pastEvent" ng-class="{'selectable': !pastEvent}" current-text="{@i18n key="Today"/}"
//     clear-text="{@i18n key="Clear"/}" close-text="{@i18n key="Done"/}" class="form-control"
//     datepicker-options="datepickerFrom"
//     ng-click="toggleDatepicker($event, 'fromDatePicker')" ng-change="updateLocalStorage(date, eventInfo.date)" id="date" />
//   <span class="input-group-btn">
//     <button type="button" ng-disabled="pastEvent" class="btn btn-default" ng-click="toggleDatepicker($event, 'fromDatePicker')">
//       <i class="fa fa-calendar" aria-hidden="true"></i>
//     </button>
//   </span>
// </div>
//
//
// <div class="input-group">
//   <input name="releaseDate" type="releaseDate" uib-datepicker-popup ng-model="eventInfo.releaseDate" is-open="datepicker2.fromDatePicker" ng-readonly="true" ng-disabled="pastEvent"
//     ng-class="{'selectable': !pastEvent}" current-text="{@i18n key="Today"/}" clear-text="{@i18n key="Clear"/}" close-text="{@i18n key="Done"/}" class="form-control"
//     ng-click="toggleDatepicker2($event, 'fromDatePicker')" invalid-message="'{@i18n key="Please enter a release date which is before the event date."/}'" ng-change="updateLocalStorage('releaseDate', eventInfo.releaseDate)" id="releaseDate"
//     datepicker-options="datepicker2"/>
//
//   <span class="input-group-btn">
//     <button type="button"
//       class="btn btn-default" ng-click="toggleDatepicker2($event, 'fromDatePicker')">
//       <i class="fa fa-calendar" aria-hidden="true"></i>
//     </button>
//   </span>
// </div>
