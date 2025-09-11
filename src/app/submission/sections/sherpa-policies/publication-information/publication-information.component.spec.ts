import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SherpaDataResponse, TranslateLoaderMock } from '@dspace/core'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { PublicationInformationComponent } from './publication-information.component';

describe('PublicationInformationComponent', () => {
  let component: PublicationInformationComponent;
  let fixture: ComponentFixture<PublicationInformationComponent>;
  let de: DebugElement;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock,
          },
        }),
        PublicationInformationComponent,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicationInformationComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    component.journal = SherpaDataResponse.sherpaResponse.journals[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show 6 rows', () => {
    expect(de.queryAll(By.css('.row')).length).toEqual(6);
  });

});
