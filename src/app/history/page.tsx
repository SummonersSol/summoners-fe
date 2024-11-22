'use client';
import { AxiosResponse } from 'axios';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import BackButton from '@/components/BackButton';
// import Spinner from '@/components/Spinner';
import axios from '@/services/axios';
import './styles.scss';
import { getMonsterIcon } from '@/common/utils';
import { BattleResult } from '@/@types/history/types';
import { useUserState } from '@/providers/userStateProvider';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const getDuration = (time_start: string, time_end: string) => {
    //in seconds
	let start = moment(time_start); // some random moment in time (in ms)
	let end = moment(time_end); // some random moment after start (in ms)
	let diff = end.diff(start);

	// execution
	return moment.utc(diff).format("mm:ss");
}

const RESULT_PER_PAGE = 10;

const BattleHistory = () => {
    const {user} = useUserState();
    const router = useRouter();

    const [ results, setResults ] = useState<BattleResult[]>([]); 
	const [ isLoading, setIsLoading ] = useState(true);
	const [ page, setPage ] = useState(0);
	const [ maxPage, setMaxPage ] = useState(0);

	useEffect(() => {
		if(!user.address) {
			return;
		}

		const getBattleResult = async() => {
			if(!user.address) {
				return;
			}
			
			try {
				let res = await axios.post<any, AxiosResponse<BattleResult[]>>(`/game/battleResults`, { address: user.address });
				setResults(res.data);
				setMaxPage(Math.ceil((res.data.length) / RESULT_PER_PAGE) - 1);
			}

			catch {
				toast.error('Logs are messed up');
			}
			
			setIsLoading(false);
		}

		getBattleResult();
	}, [user.address]);

	const paginated = useMemo(() => {
		if(results.length === 0) {
			return [];
		}
		
		let paginated: BattleResult[] = [];
		let initialIndex = page * RESULT_PER_PAGE;

		// for optimization purposes
		for(let i = 0; i < RESULT_PER_PAGE; i++) {
			let currentIndex = i + initialIndex;
			if(currentIndex >= results.length) {
				break;
			}
			paginated.push(results[currentIndex]);
		}

		return paginated;
	}, [page, results]);

	const onRightClick = useCallback(() => {
		let nextPage = page + 1;
		if(nextPage <= maxPage) {
			setPage(nextPage);
		}
	}, [page, maxPage]);

	const onLeftClick = useCallback(() => {
		let nextPage = page - 1;
		if(nextPage >= 0) {
			setPage(nextPage);
		}
	}, [page]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="battle-history-page">
                <div className="self-start flex flex-row justify-between w-full">
                    <BackButton
                        onButtonClick={() => { router.push('/home'); }}
                    />
                    {
                        paginated.length > 0 &&
                        <div className="pagination">
                            <button onClick={onLeftClick}>
                                <FontAwesomeIcon
                                    icon={faChevronLeft}
                                />
                            </button>
                            <span>{page + 1} / {maxPage + 1}</span>
                            <button onClick={onRightClick}>
                                <FontAwesomeIcon
                                    icon={faChevronRight}
                                />
                            </button>
                        </div>
                    }
                </div>
                <div className="battle-history-container">
                {
                    paginated.length === 0 &&
                    !isLoading &&
                    <>
                        <div className="h1">Such Empty</div>
                        <div className="h3">Pls go hunt</div>
                    </>
                }
                {
                    paginated.map((x, index) => {
                        let result = "defeat";

                        if(x.is_captured) {
                            result = "captured";
                        }

                        else if(x.hp_left <= 0) {
                            result = "victory";
                        }

                        return (
                            <button 
                                className="history" 
                                key={`battle-history-${index}`}
                                onClick={() => { router.push(`/battleResult/${x.battle_id}/history`) }}
                            >
                                <img src={getMonsterIcon(x.img_file, x.element_id, x.is_shiny)} alt="monster_icon" />
                                <div className="flex flex-col w-full">
                                    <div className="battle-stats">
                                        <div className="flex flex-row justify-between">
                                            <span>{moment(x.time_start).format('YYYY-MM-DD HH:mm:ss')}</span>
                                            <div className="flex flex-row">
                                                <span>{getDuration(x.time_start, x.time_end)}</span>
                                            </div>
                                        </div>
                                        <div className={`result-container ${result}`}>
                                            <span>{result}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        )
                    })
                }
                </div>
            </div>
        </div>
    )
}

export default BattleHistory;