
import { KF_A1, KF_D8 } from '../constants';
import { KF_C3, KF_A2 } from '../types';
import { KF_D4, KF_B4 } from '../syncLogic';
import { KF_B2, KF_C6 } from '../effects';

const KEY_1_PARTS = [KF_A1, KF_B2, KF_C3, KF_D4];

const KEY_2_PARTS = [KF_A2, KF_B4, KF_C6, KF_D8];

const key1 = KEY_1_PARTS.join(''); 
const key2 = KEY_2_PARTS.join(''); 

let cachedMasterKey: string | null = null;

export function getMasterKey(): string {
    if (cachedMasterKey) {
        return cachedMasterKey;
    }
    cachedMasterKey = key1 + key2;
    return cachedMasterKey;
}
