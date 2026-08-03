import { Component, inject } from '@angular/core';
import { DeplacementDetailFacade } from '../deplacement-detail.facade';
import {
  expensesTotal,
  formatDeploymentDate,
  formatExpenseAmount,
} from '../../utils/deployment-display';

@Component({
  selector: 'app-deployment-expenses-tab',
  standalone: true,
  templateUrl: './deployment-expenses-tab.component.html',
  styleUrl: '../deplacement-detail.shared.scss',
})
export class DeploymentExpensesTabComponent {
  readonly f = inject(DeplacementDetailFacade);
  readonly formatDeploymentDate = formatDeploymentDate;
  readonly formatExpenseAmount = formatExpenseAmount;

  expensesTotal(expenses: { amount: number }[] | null | undefined): number {
    return expensesTotal(expenses);
  }
}
