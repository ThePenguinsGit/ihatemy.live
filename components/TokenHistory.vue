<template>
  <Card variant="panel" class="items-start">
    <div class="flex justify-between w-full items-baseline gap-2">
      <div>
        <h1 class="font-[minecraft] uppercase">Token history</h1>
        <i v-if="data">{{ data.total }} logged · <span v-if="data.total > 0">newest</span><span v-else>nothing</span> first</i>
        <i v-else>Loading…</i>
      </div>
      <div class="flex items-center gap-4 shrink-0">
        <div v-if="data" class="text-right">
          <div class="font-[minecraft] text-lg leading-none" :class="data.balance.amount >= 0 ? 'text-alive' : 'text-ded'">
            {{ data.balance.amount.toLocaleString() }}
          </div>
          <div class="text-xs uppercase tracking-wider text-secondaryLight">{{ data.balance.tokenName }}</div>
        </div>
        <div v-if="data && data.totalPages > 1" class="flex items-center gap-2">
          <PixelButton class="!py-1 text-sm" :disabled="page <= 1" @click="page--">←</PixelButton>
          <span class="font-[minecraft] text-sm whitespace-nowrap">{{ data.page }} / {{ data.totalPages }}</span>
          <PixelButton class="!py-1 text-sm" :disabled="page >= data.totalPages" @click="page++">→</PixelButton>
        </div>
      </div>
    </div>
    <div class="w-full overflow-x-auto">
      <table class="pixel-table">
        <thead>
          <tr class="text-left">
            <th>Reason</th>
            <th class="w-40">When</th>
            <th class="w-32 text-right">Amount</th>
          </tr>
        </thead>
        <tbody v-if="data && data.data.length">
          <tr v-for="entry in data.data" :key="entry.id">
            <td><b>{{ entry.reason }}</b></td>
            <td class="font-mono" :title="formatAbsolute(entry.time)">{{ formatRelative(entry.time) }}</td>
            <td class="text-right whitespace-nowrap font-mono" :class="entry.amount >= 0 ? 'text-alive' : 'text-ded'">
              {{ formatAmount(entry.amount) }} <span class="text-secondaryLight">{{ entry.tokenName }}</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="data">
          <tr>
            <td colspan="3" class="py-6! text-center">
              No tokens yet — get grinding.
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="i in 5" :key="i">
            <td><Loading width="9em">&nbsp;</Loading></td>
            <td><Loading width="6em">&nbsp;</Loading></td>
            <td class="text-right"><Loading width="5em">&nbsp;</Loading></td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import type PaginatedResponseInterface from "~/interfaces/PaginatedResponseInterface";
import type TokenHistoryEntryInterface from "~/interfaces/TokenHistoryEntryInterface";

interface TokenHistoryResponse extends PaginatedResponseInterface<TokenHistoryEntryInterface> {
  balance: { amount: number, tokenName: string };
}

const page = ref(1)

const { data } = await useFetch<TokenHistoryResponse>('/api/user/token-history', {
  query: { page },
})

const formatAmount = (amount: number) => `${amount >= 0 ? '+' : '−'}${Math.abs(amount).toLocaleString()}`
const formatRelative = (unix: number) => useDayjs().unix(unix).fromNow()
const formatAbsolute = (unix: number) => useDayjs().unix(unix).format('LLLL')
</script>
