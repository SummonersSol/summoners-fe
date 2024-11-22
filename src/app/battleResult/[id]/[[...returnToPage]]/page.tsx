'use client';
import { AxiosResponse } from 'axios';
// import moment from 'moment';
import React, { useCallback, useEffect, useState, useContext, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getElementTooltip, getMonsterIcon, getSkillIcon, toLocaleDecimal } from '@/common/utils';
import BackButton from '@/components/BackButton';
import ElementIcon from '@/components/ElementIcon';
import MonsterCard from '@/components/MonsterCard';
import Spinner from '@/components/Spinner';
import axios from '@/services/axios';
import './styles.scss';
import { BattleResult, BattleResultResponse, BattleSkillsUsed, MVP, SkillsUsageTableProps } from '@/@types/battleResult/types.d';
import { useUserState } from '@/providers/userStateProvider';
import { useRouter } from 'next/navigation';

const BattleResultPage = ({params: { id, returnToPage }}: {params: { id: string, returnToPage?: string[] }}) => {
    const { user } = useUserState();
    const router = useRouter();

	const [ isLoading, setIsLoading ] = useState(true);

	const [ result, setResult ] = useState<BattleResult | undefined>();
	const [ skillsUsed, setSkillsUsed ] = useState<BattleSkillsUsed[]>([]);
	// const [ duration, setDuration ] = useState(0);
	const [ mvp, setMvp ] = useState<MVP | undefined>();

	useEffect(() => {
		if(!user.address) {
			return;
		}

		const getBattleResult = async() => {
			if(!user.address || !id) {
				return;
			}

			try {
				let res = await axios.post<any, AxiosResponse<BattleResultResponse>>(`/game/battleResult`, { address: user.address, battleId: id });
				let { result, skillsUsed } = res.data;
				setResult(result);
				setSkillsUsed(skillsUsed);

				// in seconds
				// let duration = (moment(result.time_end).unix() - moment(result.time_start).unix());
				// setDuration(duration);

				//set mvp
				let monsterTotalDamage: {[monster_id: number]: number } = {};
				let mvp: MVP = {
					damage: 0,
					imgFile: "",
					monsterElement: 0,
					isShiny: false,
					name: "",
					attack: 0,
					defense: 0,
					hp: 0,
					crit_chance: 0,
					crit_multiplier: 0,
				};

				let mvpDamageDealt = 0;

				for(const skill of skillsUsed) {
					if(!monsterTotalDamage[skill.monster_id]) {
						monsterTotalDamage[skill.monster_id] = 0;
					}
					monsterTotalDamage[skill.monster_id] += skill.total_damage_dealt;

					if(monsterTotalDamage[skill.monster_id] > mvpDamageDealt){
						mvpDamageDealt = monsterTotalDamage[skill.monster_id];
						mvp.damage = mvpDamageDealt;
						mvp.imgFile = skill.monster_img;
						mvp.monsterElement = skill.monster_element_id;
						mvp.isShiny = skill.is_shiny;
						mvp.name = skill.monster_name;
						mvp.attack = skill.monster_attack;
						mvp.defense = skill.monster_defense;
						mvp.hp = skill.monster_hp;
						mvp.crit_chance = skill.monster_crit_chance;
						mvp.crit_multiplier = skill.monster_crit_multiplier;
					}
				}

				setMvp(mvp);
			}

			catch {
				toast.error('Another waterlogged diary');
			}

			setIsLoading(false);
		}

		getBattleResult();
	}, [user.address, id]);

	const capture = useCallback(async() => {
		try {
			await axios.post(`/game/capture`, {
				address: user.address,
				battleId: id,
			});
		}
		catch(e: any) {
			return false;
		}
	}, [user.address, id]);

	const encounterTooltip = useMemo(() => {
		if(!result) return "";

		let { attack, defense, hp, crit_chance, crit_multiplier, is_shiny, is_captured, element_id } = result;
		let tooltip = `Attack\t\t${attack}\n`;
		tooltip += `Defense\t\t${defense}\n`;
		tooltip += `HP\t\t\t${hp}\n`;
		tooltip += `Crit Chance\t${crit_chance}\n`;
		tooltip += `Crit Multiplier\t${crit_multiplier}x\n`;
		tooltip += `Shiny\t\t${is_shiny? 'Yes' : 'No'}\n`;
		tooltip += `Captured\t\t${is_captured? 'Yes' : 'No'}\n`;
		tooltip += getElementTooltip(element_id);
		return tooltip;
	}, [result]);

	const mvpTooltip = useMemo(() => {
		if(!mvp) return "";

		let { attack, defense, hp, crit_chance, crit_multiplier, isShiny, monsterElement } = mvp;
		let tooltip = `Attack\t\t${attack.toFixed(0)}\n`;
		tooltip += `Defense\t\t${defense.toFixed(0)}\n`;
		tooltip += `HP\t\t\t${hp.toFixed(0)}\n`;
		tooltip += `Crit Chance\t${crit_chance.toFixed(0)}\n`;
		tooltip += `Crit Multiplier\t${crit_multiplier.toFixed(0)}x\n`;
		tooltip += `Shiny\t\t${isShiny? 'Yes' : 'No'}\n`;
		tooltip += getElementTooltip(monsterElement);
		return tooltip;
	}, [mvp]);

    return (
		<div className='battle-result-page'>
			<Spinner
				text='Loading'
				show={isLoading}
				type="pulse"
				mode='light'
				fullScreen
			/>
			{
				!isLoading &&
				result &&
				<div className='battle-result-container'>
					<div className="flex flex-row items-start justify-between w-full">
						<BackButton
							onButtonClick={() => {
								if(!returnToPage || !returnToPage[0]) {
									router.push('/home');
									return;
								}
								
								router.push(`/${returnToPage[0]}`);
							}}
						/>
						<div className="self-center">
							<h1 className={`${result.hp_left < 0? 'victory' : 'defeat'}`}>{result.hp_left < 0? "Victory" : "Defeat"}</h1>
						</div>
					</div>
					<div className="flex flex-row flex-1 h-full p-0 m-">
						<div className={`h-full flex flex-col flex-1 justify-center`}>
							<h2 className='text-center'>Encountered</h2>
							<div className="monster-card-container">
								<MonsterCard
									imageFile={result.img_file}
									elementId={result.element_id}
									attack={result.attack}
									defense={result.defense}
									hp={result.hp}
									crit={result.crit_chance}
									additionalInfo={encounterTooltip}
									isShiny={result.is_shiny}

									showMintButton={result.hp_left < 0}
									mintButtonText={`Captured on ${result.time_end}`}
									onMintButtonClick={capture}
									disableMintButton={true}
								/>
							</div>
						</div>


						{
							skillsUsed.length > 0 &&
							<div className='flex-1 pl-2'>
								<h2 className='text-center'>Skills Used</h2>
								<SkillsUsageTable
									skills={skillsUsed}
								/>
							</div>
						}
						{
							/* mvp && mvp.damage > 0 &&
							<div className="w-[50%]">
								<h2 className='text-center'>MVP</h2>
								<MonsterCard
									imageFile={mvp.imgFile}
									elementId={mvp.monsterElement}
									attack={mvp.attack}
									defense={mvp.defense}
									hp={mvp.hp}
									crit={mvp.crit_chance}
									additionalInfo={mvpTooltip}
									isShiny={mvp.isShiny}
								>
									<span className='mvp-damage'>Damage: {toLocaleDecimal(mvp.damage, 0, 0)}</span>
								</MonsterCard>
							</div> */
						}
					</div>
				</div>
			}
			{
				!isLoading &&
				!result &&
				<>
				<span>Error</span>
				</>
			}
		</div>
	);
}

const SkillsUsageTable = ({ skills }: SkillsUsageTableProps ) => {
	if(skills.length === 0) return null;

	//sort by dps
	skills = skills.sort((a,b) => (a.total_damage_dealt / a.total_cooldown) > (b.total_damage_dealt / b.total_cooldown)? -1 : 1);

	return (
		<div className="skills-usage-container">
			<div className="result-table-container">
				<table className='table result-table'>
					<thead>
						<tr>
							<th>Guardian</th>
							<th>Skill</th>
							<th>Element</th>
							<th>Total Damage</th>
							<th>Crit Damage</th>
							<th>Hits</th>
							<th>Crits</th>
							<th>Misses</th>
							<th>DPS</th>
						</tr>
					</thead>
					<tbody>
						{
							skills.map((x, index) => (
								<tr key={`battle-skills-${index}`}>
									<td>
										<div className="flex items-center">
											<img src={getMonsterIcon(x.monster_img, x.monster_element_id, x.is_shiny)} alt="monster_icon" />
										</div>
									</td>
									<td>
										<div className="flex items-center">
											<img src={getSkillIcon(x.skill_icon)} alt="skill_icon" />
										</div>
									</td>
									<td>
										<div className="flex items-center">
											<ElementIcon elementId={x.element_id} size={1}/>
										</div>
									</td>
									<td><div>{toLocaleDecimal(x.total_damage_dealt, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.crit_damage_dealt, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.hits, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.crits, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.misses, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.total_damage_dealt / (x.total_cooldown / 1000), 2, 2)}</div></td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default BattleResultPage;